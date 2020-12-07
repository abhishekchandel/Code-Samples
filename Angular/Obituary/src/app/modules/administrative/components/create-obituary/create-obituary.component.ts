import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AdminService } from 'src/app/core/services/admin.service';
import * as moment from 'moment';
import { ConfirmDialogModel, ConfirmDialogComponent } from 'src/app/shared/ui/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MatStepper } from '@angular/material/stepper';
import { MatSnackbarComponent } from 'src/app/shared/ui/mat-snackbar/mat-snackbar.component';
import { LocalStorageService } from 'src/app/core/services/local-storage.service';
import { Router, ActivatedRoute } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { NgForm } from '@angular/forms';
import { BaseUrl } from 'src/app/config/url-config'
import { first } from 'rxjs/operators';

@Component({
    selector: 'app-create-obituary',
    templateUrl: './create-obituary.component.html',
    styleUrls: ['./create-obituary.component.scss']
})
export class CreateObituaryComponent implements OnInit {
    @ViewChild('paymentModal') modal: ElementRef;

    @ViewChild('identificationForm') identificationForm?: NgForm;
    @ViewChild('deathDate') deathDate?: NgForm;
    @ViewChild('locationForm') locationForm?: NgForm;
    @ViewChild('obituaryPhotosForm') obituaryPhotosForm?: NgForm;
    @ViewChild('obituaryEmblemForm') obituaryEmblemForm?: NgForm;
    @ViewChild('obituaryServiceForm') obituaryServiceForm?: NgForm;
    @ViewChild('obituaryNarrativeForm') obituaryNarrativeForm?: NgForm;

    showImageBlock: boolean = false;
    uploaded: boolean = false;
    show: boolean = true;
    imageSelected: boolean = false;
    isSkipped: boolean = false;
    isEdit: boolean = false;

    maxDate = moment(new Date()).format('YYYY-MM-DD');
    minDate = moment(new Date()).format('YYYY-MM-DD');

    //for binding images with server url
    assetsUrl = BaseUrl.assetsUrl;
    minimumDate: any;

    result: string = '';
    firstName: string;
    lastName: string;
    date: string;
    dateOfBirth: string;
    residenceCity: string;
    residenceState: string;
    narrative: string;
    deceasedImage: string | ArrayBuffer;
    deathCity: string;
    deathState: string;

    counter: number = 0;
    ratePerObit: number = 45;
    amount: number = 0;
    serviceType: any;
    id: number = 0;
    obituaryId: number = 0;

    payment: boolean = false;
    loading: boolean = false;
    singleItem: boolean = false;
    index: number = 0;
    stateName: string;
    cityName: string;

    skippedStepName1: string;
    photosSkipped: boolean = false;
    emblemsSkipped: boolean = false;
    imageValue: any;
    statesResponse: any;
    citiesResponse: any[] = [];
    detailedResponse: any;
    locationCitiesResponse: any;
    residenceCitiesResponse: any;
    imageTypes: any;
    emblemsResponse: any;
    servicesResponse: any;
    errorIndex: any;
    currentCartIndex: number = -1; // keeping index for edit cart obit

    stepperData: any = {};
    createObituaryRequest: any = []; //for final submission of data to API

    obituaryPhotosArray: any = [];
    //obituaryEditPhotosArray: any = [];
    obituaryServiceArray: any = [];
    deceasedIdentificationDetail: any = {};

    deceasedDeathDates: any = {};

    deceasedLocations: any = {};

    ImageIdsToDelete = [];
    obituaryPhotos = [];
    obituaryEmblems = [];
    serviceLocations = [];

    deceasedNarrative: any = {};
    serviceId: any;

    constructor(private adminService: AdminService,
        private localStorageService: LocalStorageService,
        private snackBar: MatSnackbarComponent,
        private router: Router,
        private route: ActivatedRoute,
        private modalService: BsModalService,
        public dialog: MatDialog) { }

    modalRef: BsModalRef;
    styling = {
        ignoreBackdropClick: true
    };
    requestModel = {
        obituaryId: null
    }

    ngOnInit(): void {
        window.scroll({ top: this.counter, behavior: 'smooth' });

        this.getObitPrice();
        this.getPrice();
        this.getServiceTypes();
        this.getAllStates();
        this.getImageTypes();
        this.getEmblems();
    }
    init() {
        this.initalizeStepper();
        this.initserviceLocationArr();
    }

    initObituaryPhotosArr() {

        this.obituaryPhotosArray = [];

        for (let i = 0; i < 4; i++) {

            this.obituaryPhotosArray.push({
                imageType: null,
                firstImage: null,
                firstImageBase64: null,
                firstImageType: null,
                isNewFirstImage: false,
                secondImage: null,
                secondImageBase64: null,
                secondImageType: null,
                isNewSecondImage: false,
                imageTypeText: null,
                imageId: 0
            })
        }
    }

    // initEditObituaryPhotosArr() {

    //     this.obituaryEditPhotosArray = [];

    //     for (let i = 0; i < 4; i++) {

    //         this.obituaryEditPhotosArray.push({
    //             imageType: null,
    //             firstImage: null,
    //             firstImageBase64: null,
    //             firstImageType: null,
    //             secondImage: null,
    //             secondImageBase64: null,
    //             secondImageType: null,
    //             imageTypeText: null,
    //             imageId: null
    //         })
    //     }
    // }

    initserviceLocationArr() {

        this.obituaryServiceArray = [];

        for (let i = 0; i < 4; i++) {

            this.obituaryServiceArray.push({
                typeOfService: this.serviceId,
                address: null,
                city: null,
                state: null,
                zipCode: null,
                serviceDate: null,
                startTime: null,
                endTime: null
            })
        }
    }
    getAllStates() {
        this.loading = true;
        this.adminService.getAllStates().subscribe(response => {
            this.statesResponse = response.Data.State;
            this.loading = false;
        }, error => {
            this.loading = false;
        })
    }

    getCities(id: number, index) {
        let getCitiesRequest = {
            StateId: Number(id)
        }
        this.adminService.getAllCities(Number(id)).subscribe(response => {
            this.citiesResponse[index] = response.Data.City;
        }, error => {

        })
    }
    getLocationCities(id: number) {
        let getCitiesRequest = {
            StateId: Number(id)
        }
        this.adminService.getAllCities(Number(id)).subscribe(response => {
            this.locationCitiesResponse = response.Data.City;
        }, error => {

        })
    }
    getResidenceCities(id: number) {
        let getCitiesRequest = {
            StateId: Number(id)
        }
        this.adminService.getAllCities(Number(id)).subscribe(response => {
            this.residenceCitiesResponse = response.Data.City;
        }, error => {

        })
    }
    getEmblems() {
        this.adminService.getEmblems().subscribe(response => {
            this.emblemsResponse = response.Data.globalCodeResponse;
        }, error => {

        })
    }
    getImageTypes() {
        this.adminService.getImageTypes().subscribe(response => {
            this.imageTypes = response.Data.globalCodeResponse;
        }, error => {

        })
    }
    getServiceTypes() {
        
        this.adminService.getServiceTypes().subscribe(response => {
            this.servicesResponse = response.Data.globalCodeResponse;
            this.serviceType = this.servicesResponse.find(x => x.CodeName == "No Service")
            this.serviceId = this.serviceType.GlobalCodeId;
            this.route.queryParams.subscribe(params => {
                this.obituaryId = params["obitId"];
                this.requestModel.obituaryId = Number(this.obituaryId);
            });
            if (this.requestModel.obituaryId > 0) {
                this.getObitDetails()
            }
            if (typeof this.obituaryId === 'undefined' || this.obituaryId == 0) {
                this.init();
            }


        }, error => {

        })
    }

    selectImageType(event: any, index: number) {
        
        let element = event.target;
        let { selectedIndex } = element;
        this.obituaryPhotosArray[index].imageTypeText = element.options[selectedIndex].innerText;
        //if(this.isEdit)this.obituaryEditPhotosArray[index].imageId = element.options[selectedIndex].value

    }
    clearObitaryPhoto(index: number, imageId: number) {
        
        if (this.obituaryPhotosArray[index]) {
            this.obituaryPhotos[index] = {};
            this.obituaryPhotosArray[index] = {
                // imageType: null,
                // firstImage: null,
                // secondImage: null

                imageType: null,
                firstImage: null,
                firstImageBase64: null,
                firstImageType: null,
                isNewFirstImage: false,
                secondImage: null,
                secondImageBase64: null,
                secondImageType: null,
                isNewSecondImage: false,
                imageTypeText: null,
                imageId: 0
            }
        }
        if (imageId == 0) {
            return false;
        }
        else {
            this.ImageIdsToDelete.push(imageId);
        }
    }
    selectEmblemType(event: any, index: number) {
        let element = event.target;
        let { selectedIndex } = element;

        if (selectedIndex == 0) {
            this.clearObitaryEmblem(index);
            return;
        }

        if (!this.obituaryEmblems[index]) this.obituaryEmblems[index] = {};

        this.obituaryEmblems[index].typeOfEmblem = element.value;
        this.obituaryEmblems[index].typeOfEmblemText = element.options[selectedIndex].innerText;
        this.obituaryEmblems[index].imageUrl = element.options[selectedIndex].getAttribute("data-url");
    }
    getStateName(e) {
        this.stateName = e.target.options[e.target.selectedIndex].text
    }
    getCityName(e) {
        this.cityName = e.target.options[e.target.selectedIndex].text
    }
    //date handling for date of birth validation
    handleDateSelection() {
        this.deceasedIdentificationDetail.dateOfBirth = moment(this.deceasedIdentificationDetail.dateOfBirth).format('YYYY-MM-DD');
        this.minimumDate = moment(this.deceasedIdentificationDetail.dateOfBirth).format('YYYY-MM-DD');
    }
    handleDeathDateSelection() {
        this.deceasedDeathDates.dateOfDeath = moment(this.deceasedDeathDates.dateOfDeath).format('YYYY-MM-DD');
    }
    formatServiceDate(id) {
        
        this.obituaryServiceArray[id].serviceDate = moment(this.obituaryServiceArray[id].serviceDate).format('YYYY-MM-DD')
    }

    clearObitaryEmblem(index: number) {
        if (this.obituaryEmblems[index]) {
            this.obituaryEmblems[index] = {};;
        }
    }

    clearObitaryService(index: number) {
        if (this.obituaryServiceArray[index]) {
            this.serviceLocations[index] = {};

            this.obituaryServiceArray[index] = {
                typeOfService: this.serviceId,
                address: null,
                city: null,
                state: null,
                zipCode: null
            };;
        }
    }

    imgUpload($event, index) {
        var reader = new FileReader();
        const file = $event.target.files[0];
        const fileName = $event.target.attributes['data-key'].value;
        
        reader.readAsDataURL(file);

        this.obituaryPhotosArray[index][`isNew${fileName}`] = true;
        this.obituaryPhotosArray[index][`${fileName}Type`] = file.type.split('/')[1];

        reader.onload = () => {
            this.obituaryPhotosArray[index][`${fileName}Base64`] = reader.result;
        };
    }
    //for editting an obit
    getObitDetails() {
        
        this.loading = true;
        this.isEdit = true;
        this.adminService.getObituaryById(this.requestModel).subscribe(response => {
            this.detailedResponse = response.Data;
            this.loading = false;
            this.deceasedIdentificationDetail.armedForces = this.detailedResponse.ArmedForces;
            this.deceasedIdentificationDetail.firstName = this.detailedResponse.FirstName;
            this.deceasedIdentificationDetail.lastName = this.detailedResponse.LastName;
            this.deceasedIdentificationDetail.maidenName = this.detailedResponse.MaidenName;
            this.deceasedIdentificationDetail.middleName = this.detailedResponse.MiddleName;
            this.deceasedIdentificationDetail.nickName = this.detailedResponse.NickName;
            this.deceasedIdentificationDetail.familyEmail = this.detailedResponse.FamilyEmail;
            this.deceasedIdentificationDetail.dateOfBirth = this.detailedResponse.DateOfBirth;


            this.deceasedDeathDates.dateOfDeath = this.detailedResponse.DeathDate;
            this.deceasedDeathDates.dateOfObitPublishing = this.detailedResponse.PostingDate;

            this.deceasedLocations.deathState = (this.detailedResponse.DeathState).toString();
            this.deceasedLocations.residenceState = this.detailedResponse.ResidenceState.toString();
            this.deceasedLocations.deathZipCode = this.detailedResponse.ZipOfDeath;
            this.deceasedLocations.residenceZipCode = this.detailedResponse.ZipOfResidence;

            this.getLocationCities(this.deceasedLocations.deathState);
            this.getResidenceCities(this.deceasedLocations.residenceState);
            this.deceasedLocations.deathCity = this.detailedResponse.DeathCity.toString();
            this.deceasedLocations.residenceCity = this.detailedResponse.ResidenceCity.toString();

            if (this.detailedResponse.Images.length == 0) {
                this.initObituaryPhotosArr();
            }
            else {
                
                this.initObituaryPhotosArr();
                //this.initEditObituaryPhotosArr();
                this.detailedResponse.Images.forEach((obituaryPhoto, index) => {
                    this.obituaryPhotosArray[index].firstImageBase64 = obituaryPhoto.FirstImage == null || obituaryPhoto.FirstImage == "" ? null : (this.assetsUrl + obituaryPhoto.FirstImage);
                    this.obituaryPhotosArray[index].secondImageBase64 = obituaryPhoto.SecondImage == null || obituaryPhoto.SecondImage == "" ? null : (this.assetsUrl + obituaryPhoto.SecondImage);
                    this.obituaryPhotosArray[index].imageType = (obituaryPhoto.ImageTypeId).toString();
                    this.obituaryPhotosArray[index].imageTypeText = (obituaryPhoto.ImageType);
                    this.obituaryPhotosArray[index].isNewFirstImage = false
                    this.obituaryPhotosArray[index].isNewSecondImage = false

                    this.obituaryPhotosArray[index].imageId = obituaryPhoto.ImageId;
                    // this.obituaryEditPhotosArray[index].imageId = null;

                });
                // this.detailedResponse.Images.forEach((obituaryPhoto, index) => {
                //     this.obituaryEditPhotosArray[index].firstImageBase64 = obituaryPhoto.FirstImage == null || obituaryPhoto.FirstImage == "" ? null : (this.assetsUrl + obituaryPhoto.FirstImage);
                //     this.obituaryEditPhotosArray[index].secondImageBase64 = obituaryPhoto.SecondImage == null || obituaryPhoto.SecondImage == "" ? null : (this.assetsUrl + obituaryPhoto.SecondImage);
                //     this.obituaryEditPhotosArray[index].imageType = (obituaryPhoto.ImageTypeId).toString();
                //     this.obituaryEditPhotosArray[index].imageId = obituaryPhoto.ImageId;
                // });
            }
            if (this.detailedResponse.Emblems.length == 0) {
                this.obituaryEmblems = []
            }
            else {
                this.obituaryEmblems = [];
                for (let i = 0; i < this.detailedResponse.Emblems.length; i++) {

                    this.obituaryEmblems.push({
                        imageUrl: null,
                        typeOfEmblem: null
                    })
                }
                this.detailedResponse.Emblems.forEach((emblemPhoto, index) => {

                    this.obituaryEmblems[index].imageUrl = this.assetsUrl + emblemPhoto.Emblem;
                    this.obituaryEmblems[index].typeOfEmblem = (emblemPhoto.EmblemTypeId).toString();

                });
            }
            if (this.detailedResponse.Services.length == 0) {
                this.initserviceLocationArr();
            }
            else {
                this.initserviceLocationArr();
                this.detailedResponse.Services.forEach((serviceData, index) => {
                    this.obituaryServiceArray[index].typeOfService = (serviceData.ServiceTypeId).toString();
                    this.obituaryServiceArray[index].address = serviceData.Address;
                    this.obituaryServiceArray[index].state = (serviceData.StateId).toString();
                    this.getCities(serviceData.StateId, index);
                    this.obituaryServiceArray[index].city = (serviceData.CityId).toString();
                    this.obituaryServiceArray[index].zipCode = serviceData.Zip;
                    this.obituaryServiceArray[index].serviceDate = serviceData.ServiceDate;
                    this.obituaryServiceArray[index].startTime = serviceData.StartTime == null ? null : moment(serviceData.StartTime, 'HH mm').format('hh:mm A');
                    this.obituaryServiceArray[index].endTime = serviceData.EndTime == null ? null : moment(serviceData.EndTime, 'HH mm').format('hh:mm A');
                });
            }

            this.deceasedNarrative.narrative = this.detailedResponse.Narrative;

        }, error => {
            this.loading = false;
        })

    }
    //for making error prompts for date fields
    checkEndDate() {
        this.deceasedDeathDates.dateOfObitPublishing = moment(this.deceasedDeathDates.dateOfObitPublishing).format('YYYY-MM-DD');
        if (this.deceasedDeathDates.dateOfObitPublishing < this.deceasedDeathDates.dateOfDeath) {
            this.errorIndex = true;
        } else {
            this.errorIndex = false;
        }
    }
    //handle date of birth
    handleDateOfBirth() {
        if (moment(this.deceasedIdentificationDetail.dateOfBirth).format('YYYY-MM-DD') > this.maxDate && this.deceasedIdentificationDetail.dateOfBirth != null) {
            this.snackBar.openSnackBar("Enter a valid Date Of Birth", 'Close', 'red-snackbar');
            return false;
        }
    }
    //for scrolling the stepper
    handleScroll(mode, activestep) {
        if (mode == "Next") {
            if (activestep == 1) {
                this.counter = 0;
            }
            window.scroll({ top: this.counter, behavior: 'smooth' });
            this.counter += 100;
        } else if (mode == "Previous") {
            if (activestep == 1) {
                this.counter = 0;
            }
            else if (activestep == 6) {
                this.counter -= 100;
            }
            else if (activestep == 7) {
                this.counter -= 280;
            }
            else {
                this.counter -= 100;

            }
            window.scroll({ top: this.counter, behavior: 'smooth' });

        }
    }

    goToNext(stepper: MatStepper, id) {
        stepper.selectedIndex = id;
        this.stepperNext('Next', id);
    }
    stepperNext(mode, id) {

        if (mode == "Next") this.pushStepData(id);

        this.handleScroll(mode, id);
    }
    //with every step the data will get assigned
    pushStepData(id) {
        

        switch (id) {
            case 1: this.stepperData.deceasedIdentificationDetail = { ...this.deceasedIdentificationDetail }; break;
            case 2: this.stepperData.deceasedDeathDates = { ...this.deceasedDeathDates }; break;
            case 3: this.stepperData.deceasedLocations = { ...this.deceasedLocations }; break;
            case 4: this.stepperData.obituaryPhotos = [...this.obituaryPhotosArray.filter(p => Number(p.imageType || p.imageId) > 0)];
                this.stepperData.ImageIdsToDelete = this.ImageIdsToDelete;
                break;
            case 5: this.stepperData.obituaryEmblems = [...this.obituaryEmblems.filter(p => Object.keys(p).length > 0)]; break;
            case 6: this.stepperData.serviceLocations = [...this.obituaryServiceArray.filter(p => p.typeOfService != this.serviceId)]; break;
            case 7: this.stepperData.deceasedNarrative = { ...this.deceasedNarrative }; break;
        }
    }
    //called when another obit is placed to reset the stepper
    initalizeStepper() {
        this.deceasedIdentificationDetail = {
            firstName: null,
            middleName: null,
            lastName: null,
            maidenName: null,
            nickName: null,
            familyEmail: null,
            armedForces: false,
            dateOfBirth: null,
        };

        this.deceasedDeathDates = {
            dateOfDeath: null,
            dateOfObitPublishing: moment(new Date()).format('YYYY-MM-DD')
        };

        this.deceasedLocations = {
            residenceCity: null,
            residenceState: null,
            residenceZipCode: null,
            deathCity: null,
            deathState: null,
            deathZipCode: null,
        };

        this.obituaryPhotos = [];
        this.initObituaryPhotosArr();


        this.obituaryEmblems = [];

        this.serviceLocations = []
        this.initserviceLocationArr();
        this.resetForm();
    }

    placeAnotherObituary(stepper: MatStepper) {
        this.isSkipped = false;
        if (this.createObituaryRequest.length == this.localStorageService.getUserCredentials().CartLimit) {
            this.snackBar.openSnackBar("You have reached your cart limit", 'Close', 'red-snackbar');
            return false;
        }
        stepper.selectedIndex = 0;
    }

    resetForm() {
        this.identificationForm.resetForm({ armedForces: false })
        this.deathDate.resetForm({ dateOfDeath: '', dateOfObitPublishing: new Date() })
        this.locationForm.resetForm();
        this.obituaryNarrativeForm.reset();
    }
    //for skip button
    skippedStep(stepper: MatStepper, id) {
        stepper.selectedIndex = id;
    }
    //the stripe form pop up opens here
    openModal() {
        if (this.modalRef)
            this.closeModal();

        this.modalRef = this.modalService.show(this.modal,
            Object.assign({}, { class: 'summaryPopUp gray modal-lg' }, this.styling)
        );
    }
    closeModal() {
        this.modalRef.hide();
    }
    //obit payment handles
    calculateAmount(index, id) {
        
        this.index = id;
        if (this.localStorageService.getUserCredentials().IsFreeTrial == '1' && (index == 'one')) {
            this.submitCartObit(id);
        }
        else if (this.localStorageService.getUserCredentials().IsFreeTrial == '1' && (index == 'all')) {
            this.adminService.submitObituary(this.createObituaryRequest).subscribe(response => {
                this.snackBar.openSnackBar(response.Message, 'Close', 'green-snackbar');
                this.loading = false;
                this.router.navigateByUrl('admin/admin-panel');
            }, error => {
                this.snackBar.openSnackBar(error, 'Close', 'red-snackbar');
                this.loading = false;
            })
        }

        else {
            if (index == 'one') {
                this.amount = 1 * this.ratePerObit;
                this.singleItem = true;
                this.openModal();
            }
            else if (index == 'all') {
                this.amount = this.createObituaryRequest.length * this.ratePerObit;
                this.singleItem = false;
                this.openModal();
            }
            else {
                return;
            }
        }

    }
    //submit function on Final Narrative screen
    submitObituaryTest() {
        
        this.loading = true;
        if (this.obituaryId > 0) {
            let userProfileId = Number(this.localStorageService.getUserCredentials().UserProfileId);
            let accountId = Number(this.localStorageService.getUserCredentials().AccountId);
            this.stepperData.accountId = accountId;
            this.stepperData.userProfileId = userProfileId;
            this.stepperData.obituaryId = this.requestModel.obituaryId;
            this.stepperData.createdBy = this.localStorageService.getUserCredentials().LoginName;
            this.createObituaryRequest.push({ ...this.stepperData });
            this.adminService.editObituary(this.stepperData).subscribe(response => {
                this.snackBar.openSnackBar(response.Message, 'Close', 'green-snackbar');
                this.loading = false;
                this.router.navigateByUrl('admin/obit-cart');
            }, error => {
                this.snackBar.openSnackBar(error, 'Close', 'red-snackbar');
                this.loading = false;
            })
        }
        else {
            
            this.loading = true;
            let userProfileId = Number(this.localStorageService.getUserCredentials().UserProfileId);
            let accountId = Number(this.localStorageService.getUserCredentials().AccountId);
            this.stepperData.accountId = accountId;
            this.stepperData.userProfileId = userProfileId;
            this.stepperData.createdBy = this.localStorageService.getUserCredentials().LoginName;
            this.createObituaryRequest.push({ ...this.stepperData });
            this.adminService.submitObituary(this.stepperData).subscribe(response => {
                this.snackBar.openSnackBar(response.Message, 'Close', 'green-snackbar');
                this.loading = false;
                this.router.navigateByUrl('admin/obit-cart');
            }, error => {
                this.snackBar.openSnackBar(error, 'Close', 'red-snackbar');
                this.loading = false;
            })
        }
        this.currentCartIndex = -1;
    }
    //this is the submit all button for moving to stripe form with api call
    submitForPayment(cart: boolean) {
        this.loading = true;
        if (cart) {
            this.submitCartObit(this.index);
        }
        else {
            this.adminService.submitObituary(this.createObituaryRequest).subscribe(response => {
                this.snackBar.openSnackBar(response.Message, 'Close', 'green-snackbar');
                this.loading = false;
                this.router.navigateByUrl('admin/admin-panel');
            }, error => {
                this.snackBar.openSnackBar(error, 'Close', 'red-snackbar');
                this.loading = false;
            })
        }
    }
    // this will submit a single obit
    submitCartObit(index) {
        
        this.loading = true;
        this.adminService.submitObituary([this.createObituaryRequest[index]]).subscribe(response => {
            this.snackBar.openSnackBar(response.Message, 'Close', 'green-snackbar');
            this.createObituaryRequest.splice(index, 1);
            this.loading = false;
        }, error => {
            this.snackBar.openSnackBar(error, 'Close', 'red-snackbar');
            this.loading = false;
        })
    }
    //this will edit the obit clicked on
    editCartObit(index, stepper: MatStepper) {
        this.isSkipped = true;
        stepper.selectedIndex = 0
        this.currentCartIndex = index;
        this.deceasedIdentificationDetail = this.createObituaryRequest[this.currentCartIndex].deceasedIdentificationDetail;
        this.deceasedDeathDates = this.createObituaryRequest[this.currentCartIndex].deceasedDeathDates;

        this.getLocationCities(this.createObituaryRequest[this.currentCartIndex].deceasedLocations.deathState);
        this.getResidenceCities(this.createObituaryRequest[this.currentCartIndex].deceasedLocations.residenceState);

        this.deceasedLocations = this.createObituaryRequest[this.currentCartIndex].deceasedLocations;
        this.obituaryPhotos = this.createObituaryRequest[this.currentCartIndex].obituaryPhotos ? this.createObituaryRequest[this.currentCartIndex].obituaryPhotos : [];
        this.obituaryPhotos.forEach((obituaryPhoto, index) => {
            this.obituaryPhotosArray[index] = {
                ...obituaryPhoto
            };
        });
        this.obituaryEmblems = this.createObituaryRequest[this.currentCartIndex].obituaryEmblems ? this.createObituaryRequest[this.currentCartIndex].obituaryEmblems : [];
        this.serviceLocations = this.createObituaryRequest[this.currentCartIndex].serviceLocations ? this.createObituaryRequest[this.currentCartIndex].serviceLocations : [];
        this.serviceLocations.forEach((location, index) => {
            this.obituaryServiceArray[index] = {
                ...location
            };
        });
        this.deceasedNarrative = this.createObituaryRequest[this.currentCartIndex].deceasedNarrative;
    }
    //getting price of obit from db
    getPrice() {
        let accountId = this.localStorageService.getUserCredentials().AccountId;
        accountId: Number(accountId)
        this.adminService.getPrice(accountId).subscribe(response => {
            if (response.Data != null) {
                this.ratePerObit = response.Data.ObituaryPrice;
            }

        }, error => {

        })
    }
    getObitPrice() {
        let accountId = this.localStorageService.getUserCredentials().AccountId;
        accountId: Number(accountId)
        this.adminService.getObitPrice().subscribe(response => {
            if (response.Data != null) {
                this.ratePerObit = response.Data.ObitPrice;
            }

        }, error => {

        })
    }


    generateFullUrl(path) {
        return this.adminService.getServerFileUrl(path);
    }
    //for binding the final narrative and the cart items
    get currentDescIdentificationDetails() {
        return this.stepperData.deceasedIdentificationDetail ? this.stepperData.deceasedIdentificationDetail : {};
    }

    get currentObituaryPhotos() {
        if (!this.stepperData.obituaryPhotos) return [];

        let images = []
        this.stepperData.obituaryPhotos.forEach(x => {
            if (x.firstImageBase64) images.push(x.firstImageBase64);
            if (x.secondImageBase64) images.push(x.secondImageBase64);
        });
        return images;
    }

    get currentDecsDeathDates() {
        return this.stepperData.deceasedDeathDates ? this.stepperData.deceasedDeathDates : {};
    }

    get currentDescLocations() {
        return this.stepperData.deceasedLocations ? this.stepperData.deceasedLocations : {};
    }

    get currentDecsNarrative() {
        return this.stepperData.deceasedNarrative ? this.stepperData.deceasedNarrative : {};
    }
}