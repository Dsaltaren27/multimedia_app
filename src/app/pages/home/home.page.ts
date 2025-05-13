import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SupabaseService } from 'src/app/core/services/supabase.service';
import { MediaService } from '../../core/services/media.service';
import { PreferencesService } from '../../core/services/preferences.service';
import { AlertController, LoadingController } from '@ionic/angular';
import { FirestoreService } from '../../core/services/firebase.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false
})
export class HomePage {

  form: FormGroup;
  fileName: string | null = null;
  mimeType: string | null = null;
  filePreviewUrl: string | null = null;
  imageFile: File | null = null;
  isUploading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private mediaService: MediaService,
    private supabaseService: SupabaseService,
    private firestoreService: FirestoreService,
    private preferencesService: PreferencesService,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) {
    this.form = this.fb.group({
      description: ['', Validators.required]
    });
  }

async pickImage() {
  const result = await this.mediaService.pickFiles();
  if (result && result.files.length > 0) {
    console.log("Result " + JSON.stringify(result));

    const file = result.files[0];
    try {
      // Usamos directamente el blob que ya está en el objeto file
      const blob = file.blob;
      if (!blob) {
        throw new Error('Blob is undefined');
      }
      const imageFile = new File([blob], file.name, { type: file.mimeType });

      this.fileName = file.name;
      this.mimeType = file.mimeType;
      this.filePreviewUrl = URL.createObjectURL(imageFile);
      console.log("filePreviewUrl " + this.filePreviewUrl);
      // ¡Añadimos esta línea para asignar el File a la variable del componente!
      this.imageFile = imageFile;
    } catch (error) {
      alert("Error al procesar la imagen: " + error);
    }
  }
}
  async captureNewImage() {
    try {
      const imageUrl = await this.mediaService.captureImage();
      if (!imageUrl) {
        this.presentAlert('Error', 'No se pudo capturar la imagen.');
        return;
      }
      try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const imageName = `captured_${Date.now()}.jpeg`;
        this.imageFile = new File([blob], imageName, { type: 'image/jpeg' });
        this.fileName = imageName;
        this.mimeType = 'image/jpeg';
        this.filePreviewUrl = URL.createObjectURL(this.imageFile);
      } catch (error) {
        console.error('Error al convertir la URI de la cámara a Blob:', error);
        this.presentAlert('Error', 'Error al procesar la imagen capturada.');
        return;
      }
      console.log('Image captured:', imageUrl);
    } catch (error) {
      this.presentAlert('Error', `Error al capturar la imagen: ${error}`);
    }
  }

  async uploadImageAndSaveData() {
    if (!this.imageFile || !this.form.valid) {
      this.presentAlert('Error', 'Por favor, selecciona o captura una imagen y completa la descripción.');
      return;
    }

    const description = this.form.get('description')!.value;
    const filePath = `images/${Date.now()}_${this.fileName}`;
    let loading: HTMLIonLoadingElement | undefined;

    try {
      this.isUploading = true;
      loading = await this.loadingController.create({
        message: 'Guardando...',
      });
      await loading.present();

      const imageUrl = await this.supabaseService.uploadImage(this.imageFile, filePath);

      await this.firestoreService.addMedia(description, imageUrl);

      await this.preferencesService.set('imageUrl', imageUrl);
      await this.preferencesService.set('description', description);

      this.presentAlert('Éxito', 'Imagen subida y datos guardados correctamente.');
      this.resetForm();
    } catch (error: any) {
      console.error('Error al subir y guardar:', error);
      this.presentAlert('Error', `Hubo un problema al subir la imagen y guardar los datos: ${error}`);
    } finally {
      this.isUploading = false;
      if (loading) {
        await loading.dismiss();
      }
    }
  }

  clearImagePreview() {
    this.filePreviewUrl = null;
    this.imageFile = null;
    this.fileName = null;
    this.mimeType = null;
  }

  async presentAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK'],
    });
    await alert.present();
  }

  resetForm() {
    this.form.reset();
    this.fileName = null;
    this.mimeType = null;
    this.filePreviewUrl = null;
    this.imageFile = null;
  }
}