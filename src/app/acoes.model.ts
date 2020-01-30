export class Acao {
  id?: string;
  nome: string;
  cotacao: number;
  ticket: string;
  ordens: Ordem[];
}

export class Ordem {
  idUsuario: string;
  quantidade: number;
  valor: number;
  aberta: boolean;
  tipo: string;
  constructor() {
    this.aberta = true;
  }
}

export class Ativo {
  idAcao: string;
  quantidade: number;
}

export class Usuario {
  id?: string;
  nome: string;
  carteira: Ativo[];
}
