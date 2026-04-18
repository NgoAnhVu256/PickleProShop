"use client";

import React, { useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  height?: number;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, height = 400, placeholder }: RichTextEditorProps) {
  const editorRef = useRef<any>(null);

  const handleEditorChange = (content: string) => {
    onChange(content);
  };

  return (
    <div className="rich-text-editor-wrapper">
      <Editor
        tinymceScriptSrc="https://cdnjs.cloudflare.com/ajax/libs/tinymce/6.8.3/tinymce.min.js"
        onInit={(evt, editor) => editorRef.current = editor}
        value={value}
        onEditorChange={handleEditorChange}
        init={{
          height: height,
          menubar: false,
          plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
          ],
          toolbar: 'undo redo | blocks | ' +
            'bold italic forecolor | alignleft aligncenter ' +
            'alignright alignjustify | bullist numlist outdent indent | ' +
            'image media link | removeformat | help',
          content_style: 'body { font-family:Inter,Helvetica,Arial,sans-serif; font-size:14px; line-height:1.6; color:#323b4b; }',
          placeholder: 'Nhập mô tả sản phẩm tại đây...',
          branding: false,
          promotion: false,
          statusbar: false,
          skin: 'oxide',
          content_css: 'default',
          // Image upload configuration (using base64 for now, or you can add a handler)
          image_title: true,
          automatic_uploads: true,
          file_picker_types: 'image media',
          file_picker_callback: (cb: any, value: any, meta: any) => {
            const input = document.createElement('input');
            input.setAttribute('type', 'file');
            
            if (meta.filetype === 'image') {
              input.setAttribute('accept', 'image/*');
            } else if (meta.filetype === 'media') {
              input.setAttribute('accept', 'video/*');
            }

            input.onchange = function () {
              const file = (this as any).files[0];
              const reader = new FileReader();
              reader.onload = function () {
                const id = 'blobid' + (new Date()).getTime();
                const blobCache = (window as any).tinymce.activeEditor.editorUpload.blobCache;
                const base64 = (reader.result as string).split(',')[1];
                const blobInfo = blobCache.create(id, file, base64);
                blobCache.add(blobInfo);
                cb(blobInfo.blobUri(), { title: file.name });
              };
              reader.readAsDataURL(file);
            };

            input.click();
          },
          video_template_callback: (data: any) => {
            return `<div class="video-container"><iframe width="${data.width}" height="${data.height}" src="${data.source}" frameborder="0" allowfullscreen></iframe></div>`;
          }
        }}
      />
      <style jsx global>{`
        .rich-text-editor-wrapper {
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid #eef2f7;
        }
        .tox-tinymce {
          border: none !important;
        }
        .video-container {
          position: relative;
          padding-bottom: 56.25%;
          height: 0;
          overflow: hidden;
          max-width: 100%;
        }
        .video-container iframe {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }
      `}</style>
    </div>
  );
}
