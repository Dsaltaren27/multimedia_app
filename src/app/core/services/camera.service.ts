// src/app/core/services/media.service.ts
import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { FilePicker, PickFilesResult } from '@capawesome/capacitor-file-picker';



@Injectable({
  providedIn: 'root'
})
export class CameraService {
  // Método para capturar imagen
  constructor() {}

  async captureImage(): Promise<string> {
    const image = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera
    });
    return image.webPath!;
  }


  async pickFiles(): Promise<PickFilesResult | null> {
    if (!Capacitor.isNativePlatform()) {
      console.warn('El selector de archivos solo funciona en plataformas nativas.');
      return null;
    }

    try {
      const result = await FilePicker.pickFiles({
        types: ['image/*'],
      });

      return result.files.length > 0 ? result : null;
    } catch (error: any) {
      console.error('Error al seleccionar archivo:', error);
      return null;
    }
  }
}