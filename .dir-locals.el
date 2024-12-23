((nil . ((lsp-rust-analyzer-exclude-globs . ["*/**/node_modules" ".*"])
         (lsp-rust-analyzer-exclude-dirs . ["node_modules"])
         (lsp-enable-file-watchers . nil)))
 (typescript-ts-mode
  . ((eval . (let ((project-directory (car (dir-locals-find-file default-directory))))
               (setq lsp-clients-typescript-server-args `("--tsserver-path" ,(concat project-directory ".yarn/sdks/typescript/bin/tsserver") "--stdio"))))))
 (tsx-ts-mode
  . ((eval . (let ((project-directory (car (dir-locals-find-file default-directory))))
               (setq lsp-clients-typescript-server-args `("--tsserver-path" ,(concat project-directory ".yarn/sdks/typescript/bin/tsserver") "--stdio")))))))
