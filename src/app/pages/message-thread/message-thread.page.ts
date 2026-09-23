import { Component, ViewChild, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton, IonFooter, IonButton, IonIcon, IonSpinner,
  ToastController, ViewWillEnter
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { sendOutline, attachOutline } from 'ionicons/icons';
import { MessageService } from '../../core/services/message.service';
import { AuthService } from '../../core/services/auth.service';
import { MessageDto } from '../../core/models/message.models';
import { EmptyStateComponent } from '../../shared/empty-state.component';
import { ListingService } from '../../core/services/listing.service';

@Component({
  selector: 'app-message-thread', standalone: true,
  templateUrl: './message-thread.page.html', styleUrls: ['./message-thread.page.scss'],
  imports: [DatePipe, FormsModule, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton, IonFooter,
    IonButton, IonIcon, IonSpinner, EmptyStateComponent]
})
export class MessageThreadPage implements ViewWillEnter {
  @ViewChild(IonContent) content?: IonContent;
  private route = inject(ActivatedRoute);
  private api = inject(MessageService);
  private toast = inject(ToastController);
  private listings = inject(ListingService);
  private auth = inject(AuthService);

  threadId = Number(this.route.snapshot.paramMap.get('id'));
  loading = true; sending = false; error = '';
  messages: MessageDto[] = [];
  recipientId = 0; title = 'Chat';
  body = ''; attachment: File | null = null;

  constructor() { addIcons({ sendOutline, attachOutline }); }
  ionViewWillEnter() { this.load(); }

  isMine(m: MessageDto) { return m.recipientID === this.recipientId; }
  attachHref(m: MessageDto) { return m.attachmentURL ? this.listings.resolveImageUrl(m.attachmentURL) : ''; }

  load() {
    this.api.getThreadDetail(this.threadId).subscribe({
      next: t => {
        this.messages = t.messages || [];
        this.recipientId = t.otherParticipantID;
        this.title = t.otherParticipantName || 'Chat';
        this.loading = false; this.error = '';
        setTimeout(() => this.content?.scrollToBottom(150), 60);
      },
      error: e => { this.loading = false; this.error = e?.error?.message || 'Could not load this conversation.'; }
    });
  }

  onFile(ev: Event) { this.attachment = (ev.target as HTMLInputElement).files?.[0] || null; }

  send() {
    const text = this.body.trim();
    if ((!text && !this.attachment) || !this.recipientId || this.sending) return;
    this.sending = true;
    const file = this.attachment || undefined;
    this.api.reply(this.threadId, text, file).subscribe({
      next: () => { this.sending = false; this.body = ''; this.attachment = null; this.load(); },
      error: async e => {
        this.sending = false;
        const t = await this.toast.create({ message: e?.error?.message || 'Message not sent. Try again.', duration: 2600, color: 'danger', position: 'top' });
        await t.present();
      }
    });
  }
}
