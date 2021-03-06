import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController, LoadingController, AlertController } from '@ionic/angular';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

import { LogementsService } from '../../logements.service';
import { Logement } from '../../logement.model';

@Component({
  selector: 'app-edit-offer',
  templateUrl: './edit-offer.page.html',
  styleUrls: ['./edit-offer.page.scss']
})
export class EditOfferPage implements OnInit, OnDestroy {
  logement: Logement;
  form: FormGroup;
  private logementSub: Subscription;
  isLoading = false;
  logementId: string;

  constructor(
    private route: ActivatedRoute,
    private logementsService: LogementsService,
    private navCtrl: NavController,
    private router: Router,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController, 
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(paramMap => {
      if (!paramMap.has('logementId')) {
        this.navCtrl.navigateBack('/logements/tabs/offres');
        return;
      }
      this.logementId = paramMap.get('logementId');
      this.isLoading = true;
      this.logementSub = this.logementsService
        .getLogement(paramMap.get('logementId'))
        .subscribe(logement => {
          this.logement = logement;
          this.form = new FormGroup({
            title: new FormControl(this.logement.title, {
              updateOn: 'blur',
              validators: [Validators.required]
            }),
            description: new FormControl(this.logement.description, {
              updateOn: 'blur',
              validators: [Validators.required, Validators.maxLength(180)]
            })
          });
          this.isLoading = false;
        }, error =>{
          this.alertCtrl.create({
            header:'Une erreur est survenu.',
            message: 'Impossible de charger le logement, veuillez essayer plus tard',
            buttons: [{text: 'OK', handler: ()=>{
              this.router.navigate(['/logements/tabs/offres']);
            }}]
          }).then(alertEl => {
            alertEl.present();
          })
        });
    });
  }

  onUpdateOffer() {
    if (!this.form.valid) {
      return;
    }
    this.loadingCtrl
      .create({
        message: 'Mise à jours du logement...'
      })
      .then(loadingEl => {
        loadingEl.present();
        this.logementsService
          .updateLogement(
            this.logement.id,
            this.form.value.title,
            this.form.value.description
          )
          .subscribe(() => {
            loadingEl.dismiss();
            this.form.reset();
            this.router.navigate(['/logements/tabs/offres']);
          });
      });
  }

  ngOnDestroy() {
    if (this.logementSub) {
      this.logementSub.unsubscribe();
    }
  }
}
