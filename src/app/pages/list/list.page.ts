import { Component, OnInit } from '@angular/core';
import { Timestamp } from 'firebase/firestore';
import { Subscription } from 'rxjs';
import { Media } from 'src/app/core/core/interfaces/media';
import { FirebaseService} from 'src/app/core/services/firebase.service';
import { ImageService } from 'src/app/core/services/image.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.page.html',
  styleUrls: ['./list.page.scss'],
  standalone:false
})
export class ListPage implements OnInit {

 mutimedia: Media[] = [];
  private mediaSubscription: Subscription | undefined;
  constructor(private firebaseService: FirebaseService, private ImageService: ImageService) {}

 ngOnInit() {
    this.loadPictures();
  }

  ngOnDestroy() {
    if (this.mediaSubscription) {
      this.mediaSubscription.unsubscribe();
    }
  }

loadPictures() {
    this.mediaSubscription = this.ImageService.getAll().subscribe(pictures => {
      console.log('Datos recibidos:', pictures);
      this.mutimedia = pictures.map(media => ({
        ...media,
        createdAt: media.createdAt instanceof Timestamp ? media.createdAt.toDate() : media.createdAt
      }));
      console.log('this.mutimedia actualizado:', this.mutimedia);
    });
}
}


