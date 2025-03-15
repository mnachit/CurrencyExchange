// // auth.interceptor.ts
// import { Injectable } from '@angular/core';
// import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
// import { Observable } from 'rxjs';
// import { TokenService } from './services/token.service';

// @Injectable()
// export class HeadersInterceptor implements HttpInterceptor {
//   constructor(private tokenService: TokenService) {}

//   intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
//     const userId = this.tokenService.getID(); // Récupère l'ID de l'utilisateur
    
//     if (userId) {
//       // Cloner la requête et ajouter les en-têtes
//       const cloned = req.clone({
//         headers: req.headers
//           .set('User-Id', userId || '') // Ajoute l'ID utilisateur comme en-tête
//       });
//       return next.handle(cloned);
//     } else {
//       return next.handle(req);
//     }
//   }
// }