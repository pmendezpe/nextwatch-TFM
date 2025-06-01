import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm: FormGroup;
  mensaje: string = '';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.http.post<any>('https://nextwatch-backend.onrender.com/routes/login.php', this.loginForm.value)
        .subscribe({
          next: res => {
            if (res.success) {
              localStorage.setItem('usuario', JSON.stringify(res.usuario));
              this.router.navigate(['/profile']);
            } else {
              this.mensaje = 'Credenciales incorrectas';
            }
          },
          error: (err) => {
            console.error(err);
            this.mensaje = 'Error de conexión con el servidor';
          }
        });
    } else {
      this.mensaje = 'Por favor completa todos los campos correctamente.';
    }
  }
}
