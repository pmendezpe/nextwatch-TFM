import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  registerForm: FormGroup;
  mensaje: string = '';
  cargando = false;

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.registerForm = this.fb.group({
      nombre: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.samePasswords });
  }

  samePasswords(group: FormGroup) {
    return group.get('password')?.value === group.get('confirmPassword')?.value
      ? null : { notSame: true };
  }

  onSubmit() {
    if (this.registerForm.invalid) return;

    this.cargando = true;
    const { nombre, email, password } = this.registerForm.value;

    this.http.post('https://nextwatch-backend.onrender.com/routes/register.php', { nombre, email, password })
      .subscribe({
        next: (res: any) => {
          this.mensaje = res.mensaje;
          this.registerForm.reset();
        },
        error: (err) => {
          this.mensaje = err.error.mensaje || 'Error inesperado.';
        }
      }).add(() => this.cargando = false);
  }
}
