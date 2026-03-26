import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'elapsedTime', standalone: true, pure: true })
export class ElapsedTimePipe implements PipeTransform {
  transform(sentAt: string): string {
    return sentAt;
  }
}
