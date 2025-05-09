import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SupabaseService } from 'src/app/core/services/supabase.service';
import { Firestore, collection, addDoc, Timestamp } from '@angular/fire/firestore';
import { CameraService } from '../core/services/camera.service';

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

  constructor(
    private fb: FormBuilder,
    private CameraService: CameraService,
  ) {
    this.form = this.fb.group({
      description: ['', Validators.required]
    });
  }

 

  async pickImage() {
    const result = await this.CameraService.pickFiles();
    if (result && result.files.length > 0) {
      console.log("Result " + JSON.stringify(result))

      const file = result.files[0];
      file
      const response = await fetch(file.path!); // asegúrate que `path` no es null
      const blob = await response.blob();
      const imageFile = new File([blob], file.name, { type: file.mimeType });

      this.fileName = file.name;
      this.mimeType = file.mimeType;
      try {
        this.filePreviewUrl = URL.createObjectURL(imageFile);
        console.log("filePreviewUrl " + this.filePreviewUrl)
        console.log("Result path" + file.path)
      } catch (error) {
        alert("Error " + error)
      }

    }
  }

 

}