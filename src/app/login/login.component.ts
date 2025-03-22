import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '../services/auth.service';
import { User } from '../models/User';
import { TokenService } from '../services/token.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NgbDropdownModule
  ],
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  submitted = false;
  showPassword = false;
  showError = false;
  imageUrl?: string;
  email?: string;
  number?: string;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    public authService: AuthService,
    public tokerService: TokenService
  ) { }


  ngOnInit(): void {
    this.imageUrl = 'assets/images/currency-exchange.jpg';
    this.email = 'nachit.m.dev@gmail.com';
    this.number = "+212 696-563044";
    this.loginForm = this.formBuilder.group({
      email: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  // Getter for easy access to form fields
  get f() {
    return this.loginForm.controls;
  }

  onSubmit(): void {
    this.submitted = true;

    // Stop here if form is invalid
    if (this.loginForm.invalid) {
      return;
    }


    // Simple mock authentication (in a real app, this would be handled by a service)
    if (this.loginForm.value.email && this.loginForm.value.password) {
      const user = {
        email: this.loginForm.value.email,
        password: this.loginForm.value.password
      } as any;
      this.authService.login1(user).pipe().subscribe(
        {
          next: (response) => {
            if (response) {
              this.tokerService.saveToken(response.result);
              
              this.router.navigate(['/dashboard']);
            }
          },
          error: (error) => {
            this.showError = true;
            console.error('There was an error!', error);
          }
        }
      );
    } else {
      // Show error message
      alert('Invalid email or password');
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}