import { Component, OnInit, inject } from '@angular/core';
import { HttpEventType } from '@angular/common/http';

import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonItem, IonInput, IonList, IonBackButton, IonButtons, IonSpinner, IonText, IonSelect, IonSelectOption, IonCheckbox, IonNote, IonProgressBar, ToastController } from '@ionic/angular/standalone';
import { AuthService } from '../../../core/services/auth.service';
import { DocumentService, DocumentTypeDto } from '../../../core/services/document.service';

interface DocRow {
  docTypeId: number | null;
  file: File | null;
  error: string | null;
}

@Component({
  standalone: true,
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  imports: [FormsModule, RouterLink, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonItem, IonInput, IonList, IonBackButton, IonButtons, IonSpinner, IonText, IonSelect, IonSelectOption, IonCheckbox, IonNote, IonProgressBar]
})
export class RegisterPage implements OnInit {
  // Shared fields
  fullName = '';
  email = '';
  password = '';
  confirmPassword = '';
  role: 'contractor' | 'supplier' = 'contractor';
  companyName = '';
  phoneNumber = '';
  registrationNumber = '';
  agreeToTerms = false;

  // Supplier documents
  documentTypes: DocumentTypeDto[] = [];
  docRows: DocRow[] = [{ docTypeId: null, file: null, error: null }];
  loadingTypes = false;

  loading = false;
  error = '';
  documentsError = '';
  progress: number | null = null;

  private auth = inject(AuthService);
  private documents = inject(DocumentService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toast = inject(ToastController);

  ngOnInit() {
    const qRole = this.route.snapshot.queryParamMap.get('role');
    if (qRole === 'supplier' || qRole === 'contractor') {
      this.role = qRole;
    }
    if (this.role === 'supplier') {
      this.loadDocumentTypes();
    }
  }

  onRoleChange() {
    this.documentsError = '';
    if (this.role === 'supplier') {
      this.loadDocumentTypes();
      if (!this.docRows.length) {
        this.docRows = [{ docTypeId: null, file: null, error: null }];
      }
    }
  }

  loadDocumentTypes() {
    this.loadingTypes = true;
    this.documents.getDocumentTypes('Supplier').subscribe({
      next: (types) => {
        this.documentTypes = types || [];
        this.loadingTypes = false;
        // Pre-seed one row per required type
        const required = this.documentTypes.filter(t => t.isRequired);
        if (required.length && this.docRows.length === 1 && !this.docRows[0].file) {
          this.docRows = required.map(t => ({
            docTypeId: t.docTypeID,
            file: null,
            error: null
          }));
          if (!this.docRows.length) {
            this.docRows = [{ docTypeId: null, file: null, error: null }];
          }
        }
      },
      error: () => {
        this.loadingTypes = false;
        this.documentTypes = [];
      }
    });
  }

  get requiredTypes(): DocumentTypeDto[] {
    return this.documentTypes.filter(t => t.isRequired);
  }

  isTypeCovered(typeId: number): boolean {
    return this.docRows.some(r => r.docTypeId === typeId && r.file && !r.error);
  }

  availableTypesFor(index: number): DocumentTypeDto[] {
    const used = new Set(
      this.docRows
        .filter((_, i) => i !== index && this.docRows[i].docTypeId != null)
        .map(r => r.docTypeId)
    );
    return this.documentTypes.filter(t => !used.has(t.docTypeID));
  }

  addDocRow() {
    this.docRows.push({ docTypeId: null, file: null, error: null });
  }

  removeDocRow(index: number) {
    this.docRows.splice(index, 1);
    if (!this.docRows.length) {
      this.docRows.push({ docTypeId: null, file: null, error: null });
    }
  }

  onFilePicked(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.assignFile(index, file);
    input.value = '';
  }

  private assignFile(index: number, file: File | null) {
    const row = this.docRows[index];
    row.error = null;
    row.file = null;
    if (!file) return;

    const maxBytes = 10 * 1024 * 1024;
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    const okType = allowed.includes(file.type) ||
      /\.(pdf|jpe?g|png)$/i.test(file.name);

    if (!okType) {
      row.error = 'Only PDF, JPG or PNG allowed.';
      return;
    }
    if (file.size > maxBytes) {
      row.error = 'File must be 10MB or smaller.';
      return;
    }
    row.file = file;
  }

  /** Phone with spaces, dashes and brackets removed - the API accepts 0XXXXXXXXX or +27XXXXXXXXX only. */
  private get phoneClean(): string { return this.phoneNumber.replace(/[\s\-()]/g, ''); }

  private validateShared(): string | null {
    if (!this.fullName.trim()) return 'Full name is required.';
    if (this.fullName.trim().length > 200) return 'Full name cannot be longer than 200 characters.';
    if (!/^[A-Za-z][A-Za-z\s\-']*$/.test(this.fullName.trim())) return 'Full name can only contain letters, spaces, hyphens and apostrophes.';
    if (!this.email.trim()) return 'Email is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email.trim())) return 'Enter a valid email.';
    if (!this.password || this.password.length < 8) return 'Password must be at least 8 characters.';
    if (!/[A-Z]/.test(this.password) || !/[0-9]/.test(this.password) || !/[^A-Za-z0-9]/.test(this.password)) {
      return 'Password must include uppercase, a number, and a symbol.';
    }
    if (this.password !== this.confirmPassword) return 'Passwords do not match.';
    if (!this.companyName.trim()) return 'Company name is required.';
    if (this.companyName.trim().length > 200) return 'Company name cannot be longer than 200 characters.';
    if (!/^[A-Za-z0-9][A-Za-z0-9\s.\-&',()]*$/.test(this.companyName.trim())) return 'Company name contains invalid characters.';
    if (this.phoneClean && !/^(\+27\d{9}|0\d{9})$/.test(this.phoneClean)) return 'Enter a valid South African phone number (0XXXXXXXXX or +27XXXXXXXXX).';
    if (!this.agreeToTerms) return 'You must agree to the Terms of Service and Privacy Policy.';
    return null;
  }

  private validateSupplierDocs(): string | null {
    if (this.docRows.some(r => r.error)) {
      return 'Please fix the highlighted file errors before continuing.';
    }
    const valid = this.docRows.filter(r => r.file && r.docTypeId != null && !r.error);
    if (!valid.length) {
      return 'Please upload at least one verification document.';
    }
    for (const t of this.requiredTypes) {
      if (!this.isTypeCovered(t.docTypeID)) {
        return `Required document missing: ${t.typeName}`;
      }
    }
    for (const r of valid) {
      if (!r.docTypeId) return 'Each document must have a type selected.';
    }
    return null;
  }

  async onSubmit() {
    this.error = '';
    this.documentsError = '';

    const sharedErr = this.validateShared();
    if (sharedErr) {
      this.error = sharedErr;
      return;
    }

    if (this.role === 'supplier') {
      const docErr = this.validateSupplierDocs();
      if (docErr) {
        this.documentsError = docErr;
        return;
      }
      this.submitSupplier();
    } else {
      this.submitContractor();
    }
  }

  private submitContractor() {
    this.loading = true;
    this.auth.register({
      fullName: this.fullName.trim(),
      email: this.email.trim(),
      password: this.password,
      role: 'Contractor',
      companyName: this.companyName.trim(),
      phoneNumber: this.phoneClean || undefined
    }).subscribe({
      next: async () => {
        this.loading = false;
        const t = await this.toast.create({
          message: 'Account created. Please sign in.',
          duration: 2500,
          color: 'success',
          position: 'top'
        });
        await t.present();
        this.router.navigateByUrl('/auth/login', { replaceUrl: true });
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || err?.error?.title || 'Registration failed.';
      }
    });
  }

  private submitSupplier() {
    const valid = this.docRows.filter(r => r.file && r.docTypeId != null && !r.error);
    const files = valid.map(r => r.file!) as File[];
    const docTypeIds = valid.map(r => r.docTypeId!) as number[];

    this.loading = true;
    this.progress = 0;

    this.auth.registerSupplierWithProgress({
      fullName: this.fullName.trim(),
      email: this.email.trim(),
      password: this.password,
      companyName: this.companyName.trim(),
      registrationNumber: this.registrationNumber.trim() || undefined,
      documents: files,
      docTypeIds
    }).subscribe({
      next: async (event) => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          this.progress = Math.round((100 * event.loaded) / event.total);
        }
        if (event.type === HttpEventType.Response) {
          this.loading = false;
          this.progress = null;
          const t = await this.toast.create({
            message: 'Supplier application submitted. An admin will review your documents before activation.',
            duration: 4000,
            color: 'success',
            position: 'top'
          });
          await t.present();
          this.router.navigateByUrl('/auth/login', { replaceUrl: true });
        }
      },
      error: (err) => {
        this.loading = false;
        this.progress = null;
        this.error = err?.error?.message || err?.error?.title || 'Supplier registration failed.';
      }
    });
  }
}
