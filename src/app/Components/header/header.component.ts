import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  isMenuOpen: boolean = false;
  usuarioLogueado: boolean = false;

  constructor(private router: Router) {}

  ngOnInit() {
    this.usuarioLogueado = !!localStorage.getItem('usuario');
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  logOut() {
    localStorage.removeItem('usuario');
    localStorage.removeItem('userList');
    this.router.navigate(['/login']);
  }
}
