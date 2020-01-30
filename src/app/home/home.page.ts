import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Acao } from '../acoes.model';
import { AcoesService } from '../acoes.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  acoes$: Observable<Acao[]>;

  constructor(
    private acoesService: AcoesService
  ) {}

  ngOnInit() {
    this.acoes$ = this.acoesService.acoes$;
  }

}
