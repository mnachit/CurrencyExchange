import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';

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

  constructor(
    private formBuilder: FormBuilder,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
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

    // In a real application, you would call an authentication service here
    // For demo purposes, we'll just navigate to the dashboard
    console.log('Login credentials:', this.loginForm.value);

    // Simple mock authentication (in a real app, this would be handled by a service)
    if (this.loginForm.value.username === 'admin' && this.loginForm.value.password === 'admin') {
      // Navigate to dashboard
      this.router.navigate(['/dashboard']);
    } else {
      // Show error message
      alert('Invalid username or password');
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}