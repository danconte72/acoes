import { Component, OnInit } from '@angular/core';
import { AcoesService } from '../acoes.service';
import { ActivatedRoute } from '@angular/router';
import { Ordem, Ativo } from '../acoes.model';
import { Observable, Subscription } from 'rxjs';
import { AlertController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-acao',
  templateUrl: './acao.page.html',
  styleUrls: ['./acao.page.scss'],
})
export class AcaoPage implements OnInit {
  idAcao: string;
  ativo: Ativo;
  quantidadeComprometida = 0;
  subs: Subscription[];

  constructor(
    public acoesService: AcoesService,
    private activatedRoute: ActivatedRoute,
    public alertController: AlertController,
    public toastController: ToastController
  ) {}

  ngOnInit() {
    this.idAcao = this.activatedRoute.snapshot.paramMap.get('id');
    this.acoesService.setCurrentAcao(this.idAcao);
    this.acoesService.carteira$.subscribe(
      carteira => {
        this.ativo = carteira.filter(ativo => ativo.idAcao === this.idAcao)[0];
      }
    );
    this.acoesService.ordensUsuario$.subscribe(
      ordens => ordens.forEach((ordem) => (ordem.tipo === 'venda') ? this.quantidadeComprometida += ordem.quantidade : null)
    );
  }

  async criarOrdem(tipo: string) {
    const alert = await this.alertController.create({
      header: `Nova ordem de: ${tipo}`,
      inputs: [
        {
          name: 'quantidade',
          type: 'number',
          placeholder: 'Quantidade'
        },
        {
          id: 'valor',
          name: 'valor',
          placeholder: 'Valor',
          type: 'number'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel');
          }
        }, {
          text: 'Processar Ordem',
          handler: (data) => {
            const ordem = new Ordem();
            ordem.tipo = tipo;
            ordem.quantidade = parseFloat(data.quantidade);
            ordem.valor = parseFloat(data.valor);
            if (this.validarOrdem(ordem)) {
              this.gravarOrdem(ordem);
              return true;
            }
            return false;
          }
        }
      ]
    });

    await alert.present();
  }

  async notificar(mensagem: string) {
    const toast = await this.toastController.create({
      message: mensagem,
      duration: 5000
    });
    toast.present();
  }

  validarOrdem(ordem: Ordem) {
    // TODO convert to try catch
    if (!ordem.quantidade || ordem.quantidade < 1) {
      this.notificar('Favor informar uma quantidade maior ou igual a 1');
      return false;
    }
    const quantidadeDisponivel = this.ativo.quantidade - this.quantidadeComprometida;
    if (ordem.tipo === 'venda' && ordem.quantidade > quantidadeDisponivel ) {
      this.notificar(`Favor informar uma quantidade menor ou igual a ${quantidadeDisponivel}`);
      return false;
    }
    if (!ordem.valor || ordem.valor < 0) {
      this.notificar(`Favor informar um valor maior ou igual 0`);
      return false;
    }
    return true;
  }

  async gravarOrdem(ordem: Ordem) {
    const mensagem = await this.acoesService.processarOrdem(ordem);
    this.notificar(mensagem);
  }

}
