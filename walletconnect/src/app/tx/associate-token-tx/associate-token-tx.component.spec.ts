import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssociateTokenTxComponent } from './associate-token-tx.component';

describe('AssociateTokenTxComponent', () => {
  let component: AssociateTokenTxComponent;
  let fixture: ComponentFixture<AssociateTokenTxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssociateTokenTxComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssociateTokenTxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
