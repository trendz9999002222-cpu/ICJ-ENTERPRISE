import urllib.request
import urllib.error

urls = [
    'https://icjdjango.onrender.com/api/v1/health/',
    'https://icjdjango.onrender.com/api/v1/auth/login/',
    'https://icjdjango.onrender.com/api/v1/auth/register/',
    'https://icjdjango.onrender.com/api/v1/membership-onboarding/register/',
    'https://icjdjango.onrender.com/api/v1/membership-onboarding/configuration/'
]

for u in urls:
    for m in ['GET', 'POST']:
        req = urllib.request.Request(u, method=m)
        try:
            with urllib.request.urlopen(req) as resp:
                print(f'{m} {u} -> {resp.status}')
        except urllib.error.HTTPError as e:
            msg = e.read().decode('utf-8', errors='ignore')[:150]
            print(f'{m} {u} -> {e.code} ({msg})')
        except Exception as e:
            print(f'{m} {u} -> ERR: {e}')
