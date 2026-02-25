import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrngTxComponent } from './prng-tx.component';

describe('PrngTxComponent', () => {
  let component: PrngTxComponent;
  let fixture: ComponentFixture<PrngTxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrngTxComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrngTxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
