import { Injectable } from '@angular/core';
import { Acao, Ordem, Ativo } from './acoes.model';
import { ReplaySubject, Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map, first } from 'rxjs/operators';
import { acoes, usuarios } from './data';

@Injectable({
  providedIn: 'root'
})
export class AcoesService {
  private currentAcoes$ = new ReplaySubject<Acao[]>();
  private currentAcao$: Observable<Acao>;
  private currentCarteira$ = new BehaviorSubject<Ativo[]>([]);
  private curentIdAcao$ = new BehaviorSubject<string>(null);
  private curentIdUsuario$ = new BehaviorSubject<string>(null);

  constructor() {
    // timeout to simulate api delay
    setTimeout(
      _ => {
        this.currentAcoes$.next(acoes);
      },
      300
    );
    this.currentAcao$ = combineLatest([
      this.curentIdAcao$,
      this.currentAcoes$
    ]).pipe(
      map(
        ([curentIdAcao, currentAcoes]) => currentAcoes.filter(acao => acao.id === curentIdAcao)[0]
      )
    );
  }

  get acoes$(): Observable<Acao[]> {
    return this.currentAcoes$.asObservable();
  }

  get acao$(): Observable<Acao> {
    return this.currentAcao$;
  }

  get carteira$(): Observable<Ativo[]> {
    return this.currentCarteira$.asObservable();
  }

  get ordensUsuario$(): Observable<Ordem[]> {
    return combineLatest([
      this.curentIdUsuario$,
      this.currentAcao$
    ]).pipe(
      map(
        ([curentIdUsuario, currentAcao]) => currentAcao.ordens.filter(ordem => ordem.idUsuario === curentIdUsuario && ordem.aberta)
      )
    );
  }

  public setCurrentAcao(idAcao: string) {
    this.curentIdAcao$.next(idAcao);
  }

  public setCurrentUsuario(idUsuario: string) {
    this.curentIdUsuario$.next(idUsuario);
    this.currentCarteira$.next(usuarios.filter(usuario => usuario.id === idUsuario)[0].carteira);
  }

  public async processarOrdem(novaOrdem: Ordem): Promise<string> {
    novaOrdem.idUsuario = this.curentIdUsuario$.value;
    const acao = await this.currentAcao$.pipe(first()).toPromise();
    const ordens = acao.ordens;
    const melhorOrdem = this.melhorOrdem(ordens, novaOrdem);
    let mensagem = 'Ordem no aguardo para processamento';
    if (melhorOrdem !== novaOrdem) {
      const carteira = this.currentCarteira$.value;
      const qtds = melhorOrdem.quantidade <= novaOrdem.quantidade ? melhorOrdem.quantidade : novaOrdem.quantidade;
      this.currentCarteira$.next(carteira.map(
        ativo => {
          if (ativo.idAcao === this.curentIdAcao$.value) {
            ativo.quantidade = (novaOrdem.tipo === 'compra') ? ativo.quantidade + qtds : ativo.quantidade - qtds;
          }
          return ativo;
      }));
      if (qtds >= melhorOrdem.quantidade) {
        melhorOrdem.aberta = false;
      } else {
        melhorOrdem.quantidade -= qtds;
      }
      novaOrdem.aberta = false;
      mensagem = `Ordem de ${novaOrdem.tipo} processada com sucesso. ${qtds} ações no valor de ${melhorOrdem.valor} cada`;
    }
    ordens.push(novaOrdem);
    console.log(novaOrdem, melhorOrdem);
    return Promise.resolve(mensagem);
  }

  private melhorOrdem(ordens: Ordem[], novaOrdem: Ordem): Ordem {
    return ordens
    .reduce(
      (melhor, ordem) =>
      (ordem.idUsuario !== novaOrdem.idUsuario && ordem.tipo !== novaOrdem.tipo && ordem.aberta) &&
      (
        (novaOrdem.tipo === 'compra' && ordem.valor <= melhor.valor && ordem.valor <= novaOrdem.valor)
        ||
        (novaOrdem.tipo === 'venda' && ordem.valor >= melhor.valor && ordem.valor >= novaOrdem.valor)
      )
      ? ordem : melhor
      , novaOrdem
    );
  }

}
