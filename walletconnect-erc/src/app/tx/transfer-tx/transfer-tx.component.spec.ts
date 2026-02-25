import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransferTxComponent } from './transfer-tx.component';

describe('TransferTxComponent', () => {
  let component: TransferTxComponent;
  let fixture: ComponentFixture<TransferTxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransferTxComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TransferTxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
