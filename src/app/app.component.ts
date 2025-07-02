import { Component } from '@angular/core';
import { CommonModule, ViewportScroller } from '@angular/common';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { LoaderComponent } from './shared/components/loader/loader.component';
import { ToastComponent } from './shared/components/toast/toast.component';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    LoaderComponent,
    ToastComponent,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'العوفي - معدات البناء والتعدين';
  constructor(
    private router: Router,
    private viewportScroller: ViewportScroller
  ) {}
  ngOnInit() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.viewportScroller.scrollToPosition([0, 0]); // Scroll to top
      }
    });
  }
}
