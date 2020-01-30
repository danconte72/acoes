import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AcaoPage } from './acao.page';

describe('AcaoPage', () => {
  let component: AcaoPage;
  let fixture: ComponentFixture<AcaoPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AcaoPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AcaoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
