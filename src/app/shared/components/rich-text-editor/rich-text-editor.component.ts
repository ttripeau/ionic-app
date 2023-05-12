import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ContentChange } from 'ngx-quill';
import Quill from 'quill';

// Available style : color | background | color | align | direction | font | size
const colorStyle = Quill.import('attributors/style/color');
const alignStyle = Quill.import('attributors/style/align');
Quill.register(colorStyle, true);
Quill.register(alignStyle, true);

@Component({
  selector: 'app-rich-text-editor',
  templateUrl: './rich-text-editor.component.html',
  styleUrls: ['./rich-text-editor.component.scss'],
})
export class RichTextEditorComponent {
  @Input() value: { value: string; html: string | null } = { value: '', html: '' };
  @Input() height: string = 'calc(100vh - 160px)';

  @Output() valueUpdated: EventEmitter<{ value: string; html: string | null }> = new EventEmitter<{ value: string; html: string | null }>();

  public modules = {
    toolbar: false,
    // toolbar: [
    //   ['bold', 'italic', 'underline', 'strike'], // toggled buttons
    //   ['blockquote', 'code-block'],
    //   [{ header: 1 }, { header: 2 }], // custom button values
    //   [{ list: 'ordered' }, { list: 'bullet' }],
    //   [{ script: 'sub' }, { script: 'super' }], // superscript/subscript
    //   [{ indent: '-1' }, { indent: '+1' }], // outdent/indent
    //   [{ direction: 'rtl' }], // text direction
    //   [{ size: ['small', false, 'large', 'huge'] }], // custom dropdown
    //   [{ header: [1, 2, 3, 4, 5, 6, false] }],
    //   [{ color: [] }, { background: [] }], // dropdown with defaults from theme
    //   [{ font: [] }],
    //   [{ align: [] }],
    //   ['clean'], // remove formatting button
    //   ['link', 'image', 'video'], // link and image, video
    //   ['bold', 'italic', 'underline'],
    //   [{ color: [] }],
    //   [{ list: 'ordered' }, { list: 'bullet' }],
    //   [{ header: [2, 3, 4, false] }],
    //   [{ align: [] }],
    // ],
  };

  public contentUpdated(event: ContentChange): void {
    this.valueUpdated.emit({ html: event.html, value: event.text });
  }

  public setFocus(editor: any): void {
    setTimeout(() => {
      editor.focus();
    }, 1000);
  }
}
