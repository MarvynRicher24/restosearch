# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e4]:
    - heading "404" [level=1] [ref=e5]
    - 'heading "Page not found: /admin" [level=2] [ref=e6]'
    - paragraph [ref=e7]: "Page not found: /admin"
    - link "Go back home" [ref=e9] [cursor=pointer]:
      - /url: /
  - generic:
    - img
  - generic:
    - generic:
      - generic:
        - button "Go to parent" [disabled]
        - button "Open in editor"
        - button "Close"
  - generic:
    - generic:
      - generic:
        - generic:
          - button "Toggle Nuxt DevTools":
            - img
          - generic "Page load time":
            - generic: "-"
          - button "Toggle Component Inspector":
            - img
```