import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllowanceApproveTxComponent } from './allowance-approve-tx.component';

describe('AllowanceApproveTxComponent', () => {
  let component: AllowanceApproveTxComponent;
  let fixture: ComponentFixture<AllowanceApproveTxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllowanceApproveTxComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllowanceApproveTxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
