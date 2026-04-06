import { Component, OnInit, signal, effect, Resource } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TransportService } from '../services/transport.service';
import * as L from 'leaflet';
import confetti from 'canvas-confetti';

interface Attempt {
  number: string;
  isCorrect: boolean;
}

@Component({
  selector: 'app-game',
  standalone: true, // Angular moderno es standalone por defecto
  imports: [ReactiveFormsModule], 
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {
  map!: L.Map;
  polyline!: L.Polyline;
  
  // Usamos signals para el estado
  suggestions = signal<string[]>([]);
  message = signal<string>('');
  challengeId = signal<number | null>(null);
  gameSolved = signal<boolean>(false);
  branchInfo = signal<string>('');   
  searchControl = new FormControl('');
  maxAttempts = 6;
  attempts = signal<Attempt[]>([]);
  gameStatus = signal<'playing' | 'won' | 'lost'>('playing');
  correctNumber = signal<string>(''); // Nuevo signal

  constructor(private transportService: TransportService) {
    // Escuchamos el buscador de forma moderna
    this.searchControl.valueChanges.subscribe(value => {
      if (value && value.length > 0) {
        this.transportService.getAutocomplete(value).subscribe(data => {
          this.suggestions.set(data);
        });
      } else {
        this.suggestions.set([]);
      }
    });
  }

  ngOnInit() {
    this.initMap();
    this.loadDaily();
  }

  initMap() {
    this.map = L.map('map').setView([-34.6037, -58.3816], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);
  }

  loadDaily() {
    this.transportService.getDaily().subscribe(data => {
      this.challengeId.set(data.challengeId);
      
      // Guardamos la referencia en this.polyline
      this.polyline = L.polyline(data.points as L.LatLngExpression[], { 
        color: '#e74c3c', 
        weight: 6,
        opacity: 0.8 
      }).addTo(this.map);
      
      this.map.fitBounds(this.polyline.getBounds(), { padding: [50, 50] });
      
      setTimeout(() => this.map.invalidateSize(), 100);
    });
  }

onGuess(guess: string) {
  const id = this.challengeId();
  if (!id || this.gameStatus() !== 'playing') return;

  this.transportService.checkGuess(id, guess).subscribe((res: any) => {
    // 1. CREAMOS EL OBJETO (Esto ya lo tenés bien)
    const newAttempt: Attempt = {
      number: guess,
      isCorrect: res.success
    };

    // 2. ACTUALIZAMOS LA LISTA
    this.attempts.update(current => [...current, newAttempt]);

    // 3. SETEAMOS EL MENSAJE (Esto es lo que faltaba o se pisaba)
    this.message.set(res.message);

    if (res.success) {
      // --- VICTORIA ---
      this.gameStatus.set('won');
      this.correctNumber.set(res.number);
      this.branchInfo.set(res.branch);
      this.polyline.setStyle({ color: '#27ae60', weight: 8 });
      this.searchControl.disable();
    } else {
      // --- FALLO ---
      if (this.attempts().length >= this.maxAttempts) {
        this.gameStatus.set('lost');
        this.searchControl.disable();
        
        this.transportService.reveal(id).subscribe(data => {
          // Actualizamos el mensaje con la revelación final
          this.message.set(`¡GAME OVER! La respuesta era la Línea ${data.number}`);
          this.branchInfo.set(data.branch);
        });
      } else {
        // Mensaje intermedio para que no quede vacío
        this.message.set(`Incorrecto. Intento ${this.attempts().length} de ${this.maxAttempts}`);
      }
    }

    // 4. LIMPIEZA DE UI
    this.suggestions.set([]);
    this.searchControl.setValue('');
  });
}

isCorrectAttempt(attempt: string): boolean {
  const correct = (this.correctNumber() ?? '').toUpperCase().trim();
  const guess = (attempt ?? '').toUpperCase().trim();

  if (!correct || !guess) return false;

  // 1. Coincidencia exacta (ej: "532D" == "532D")
  // 2. El real empieza con el intento (ej: "532D" empieza con "532")
  // 3. El intento contiene al real (por las dudas)
  return (
    correct === guess || 
    correct.startsWith(guess) || 
    guess.startsWith(correct)
  );
}

  private launchConfetti() {
   confetti({
  particleCount: 100,
  spread: 70,
  origin: { y: 0.6 },
  colors: ['#e74c3c', '#27ae60', '#ffffff']
});
  }
  
}