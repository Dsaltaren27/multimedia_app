import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SupabaseService } from 'src/app/core/services/supabase.service';
import { MediaService } from '../../core/services/media.service';
import { PreferencesService } from '../../core/services/preferences.service';
import { AlertController, LoadingController } from '@ionic/angular';
import { FirebaseService } from 'src/app/core/services/firebase.service';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

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
    private preferencesService: PreferencesService,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private firebaseService: FirebaseService
  ) {
    this.form = this.fb.group({
      description: ['', Validators.required]
    });
  }

async pickImage() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.Uri,
        source: CameraSource.Photos,
      });

      console.log('Imagen seleccionada:', image);

      if (image?.webPath) {
        this.filePreviewUrl = image.webPath;
        try {
          const response = await fetch(image.webPath);
          const blob = await response.blob();
          const imageName = image.path ? image.path.substring(image.path.lastIndexOf('/') + 1) : `image_${Date.now()}.png`;
          const mimeType = image.format === 'jpeg' ? 'image/jpeg' : (image.format === 'png' ? 'image/png' : 'image/jpeg'); // Ajusta según los formatos posibles
          this.imageFile = new File([blob], imageName, { type: mimeType });
          this.fileName = imageName;
          this.mimeType = mimeType;
          this.filePreviewUrl = URL.createObjectURL(this.imageFile);
          console.log('File de la imagen seleccionada:', this.imageFile);
        } catch (error) {
          console.error('Error al convertir la URI de la galería a File:', error);
          this.presentAlert('Error', 'Error al procesar la imagen seleccionada.');
          return;
        }
      }
    } catch (error) {
      console.error('Error al seleccionar la imagen:', error);
      this.presentAlert('Error', 'Hubo un problema al seleccionar la imagen.');
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

      await this.firebaseService.addMedia(description, imageUrl);

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
      // Si necesitas un Blob para subirlo, puedes intentar obtenerlo así: