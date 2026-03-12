import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountUpdateTxComponent } from './account-update-tx.component';

describe('AccountUpdateTxComponent', () => {
  let component: AccountUpdateTxComponent;
  let fixture: ComponentFixture<AccountUpdateTxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountUpdateTxComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccountUpdateTxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
