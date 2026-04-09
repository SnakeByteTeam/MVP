import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EndpointTableComponent } from '../endpoint-table/endpoint-table.component';

@Component({
	selector: 'app-room-detail',
	standalone: true,
	imports: [RouterLink, EndpointTableComponent],
	templateUrl: './room-detail.component.html',
	styleUrl: './room-detail.component.css'
})
export class RoomDetailComponent {

}
