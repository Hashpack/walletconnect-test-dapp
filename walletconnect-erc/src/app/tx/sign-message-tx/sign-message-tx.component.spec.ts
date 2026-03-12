import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignMessageTxComponent } from './sign-message-tx.component';

describe('SignMessageTxComponent', () => {
  let component: SignMessageTxComponent;
  let fixture: ComponentFixture<SignMessageTxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignMessageTxComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SignMessageTxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
