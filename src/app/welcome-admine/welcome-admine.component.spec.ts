import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WelcomeAdmineComponent } from './welcome-admine.component';

describe('WelcomeAdmineComponent', () => {
  let component: WelcomeAdmineComponent;
  let fixture: ComponentFixture<WelcomeAdmineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WelcomeAdmineComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WelcomeAdmineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
