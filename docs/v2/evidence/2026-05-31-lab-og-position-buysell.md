# Evidence — Lab L5 buy/sell OG position filter

**Atom:** `lab-og-position-buysell`  
**Route:** `/og/buysell?position=WR`

```bash
curl -s -o /tmp/bs.png -w '%{http_code} %{size_download}\n' \
  'http://127.0.0.1:3000/og/buysell?download=1&position=WR&snapshot=eyJwIjpbeyJuIjoiSm9lIEJ1cnJvdyIsInBvcyI6IldSIiwidCI6IkNMRiIsInMiOjEyLCJzbCI6IkJ1eSJ9XX0'
# buysell 200 44258
```

PASS — Gate C2.
