import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AdminService } from 'src/app/services/rest/admin.service';
import { AlertComponent } from 'src/app/shared/modals/alert/alert.component';
import { ModalParams } from 'src/app/shared/modals/modal-params';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  public username = '';
  public password = '';
  constructor(private modalService: NgbModal,
    private router: Router,
    private adminService: AdminService) { }

  ngOnInit(): void {
  }

  public login(): void {
    let s = this.adminService.login(this.username, this.password).subscribe(
      (res: any) => {
        if (!!res.status && res.status === 'error') {
          this.displayErrorMessage(res);
        } else {
          this.router.navigate(['admin']);
        }
      }
    );
  }

  private displayErrorMessage(res: any) {
    let params: ModalParams = {}
    params = {
      headerText: 'Error',
      bodyText: res.errorDetail.message
    }
    let ref = this.modalService.open(AlertComponent, { centered: true });
    ref.componentInstance.params = params;
    ref.componentInstance.emitter.subscribe(
      () => {
        ref.close();        
      }
    );
  }

}
