import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
declare const AOS: any;

@Component({
  selector: 'app-welcome',
  standalone: false,
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css']
})
export class WelcomeComponent implements OnInit, AfterViewInit {

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Rediriger les utilisateurs déjà connectés vers le tableau de bord
    const token = localStorage.getItem('token');
    if (token && token.length > 0) {
      this.router.navigate(['dashboard']);
    }
  }

  ngAfterViewInit(): void {
    // Initialiser AOS
    if (typeof AOS !== 'undefined') {
      AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: true,
        mirror: false
      });
    }

    // Effet de scroll pour la navbar
    const navbar = document.querySelector('.navbar');
    if (navbar) {
      window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
          navbar.classList.add('scrolled');
        } else {
          navbar.classList.remove('scrolled');
        }
      });
    }

    // Animation des compteurs
    this.animateCounters();
    
    // Gestion du formulaire
    this.setupFormSubmit();
    
    // Navigation douce
    this.setupSmoothScrolling();
  }

  // Fonction pour animer les compteurs
  animateCounters(): void {
    // Code pour animer les compteurs
    this.animateValue('main-price', 0, 18500, 2000);
    setTimeout(() => {
      this.animateValue('sub-price', 0, 1500, 1500);
    }, 500);
    
    // Pour les autres compteurs
    const counterElements = document.querySelectorAll('.counter');
    counterElements.forEach(counter => {
      const target = parseInt(counter.textContent || '0');
      counter.textContent = '0';
      
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.animateValue(counter as HTMLElement, 0, target, 2000);
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5 });
      
      observer.observe(counter);
    });
  }
  
  // Fonction pour animer les valeurs numériques
  animateValue(element: HTMLElement | string, start: number, end: number, duration: number): void {
    let obj: HTMLElement | null = null;
    
    if (typeof element === 'string') {
      obj = document.getElementById(element);
    } else {
      obj = element;
    }
    
    if (!obj) return;
    
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const value = Math.floor(progress * (end - start) + start);
      
      obj!.textContent = value.toLocaleString('fr-FR');
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    
    window.requestAnimationFrame(step);
  }
  
  // Configuration du formulaire
  setupFormSubmit(): void {
    const demoForm = document.getElementById('demo-form');
    if (demoForm) {
      demoForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Récupérer les données du formulaire
        const name = (document.getElementById('name') as HTMLInputElement).value;
        const company = (document.getElementById('company') as HTMLInputElement).value;
        const email = (document.getElementById('email') as HTMLInputElement).value;
        const phone = (document.getElementById('phone') as HTMLInputElement).value;
        const message = (document.getElementById('message') as HTMLTextAreaElement).value;
        
        // Dans une application réelle, vous enverriez ces données à un serveur
        console.log('Formulaire soumis:', { name, company, email, phone, message });
        
        // Afficher un message de succès
        alert('Merci pour votre demande de démonstration! Notre équipe vous contactera prochainement.');
        
        // Réinitialiser le formulaire
        (demoForm as HTMLFormElement).reset();
      });
    }
  }
  
  // Configuration du défilement fluide
  setupSmoothScrolling(): void {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(this: HTMLAnchorElement, e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = targetId ? document.querySelector(targetId) : null;
        if (targetElement) {
          window.scrollTo({
            top: (targetElement as HTMLElement).offsetTop - 80,
            behavior: 'smooth'
          });
          
          // Fermer le menu mobile s'il est ouvert
          const navbarCollapse = document.querySelector('.navbar-collapse');
          if (navbarCollapse?.classList.contains('show')) {
            navbarCollapse.classList.remove('show');
          }
        }
      });
    });
  }
}