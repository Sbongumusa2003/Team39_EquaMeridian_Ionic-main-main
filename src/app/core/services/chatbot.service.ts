import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ChatbotReply } from '../models/chatbot.models';

@Injectable({ providedIn: 'root' })
export class ChatbotService {
  private apiUrl = `${environment.apiUrl}/chatbot`;

  constructor(private http: HttpClient) {}

  ask(message: string): Observable<ChatbotReply> {
    return this.http.post<ChatbotReply>(`${this.apiUrl}/ask`, { message });
  }
}
