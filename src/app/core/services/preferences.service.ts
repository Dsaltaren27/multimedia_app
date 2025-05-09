// src/app/core/services/preferences.service.ts
import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

@Injectable({
  providedIn: 'root'
})
export class PreferencesService {
  // Guardar datos en las preferencias
  async set(key: string, value: string): Promise<void> {
    await Preferences.set({ key, value });
  }

  // Obtener datos desde las preferencias
  async get(key: string): Promise<string | null> {
    const { value } = await Preferences.get({ key });
    return value;
  }
}