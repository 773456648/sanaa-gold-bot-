import pyzipper, concurrent.futures, multiprocessing
file = '10_sign.zip'

def check(n):
    try:
        with pyzipper.AESZipFile(file) as z:
            z.extractall(pwd=str(n).encode())
            return n
    except: return None

if __name__ == '__main__':
    cores = multiprocessing.cpu_count()
    print(f'شغالين بـ {cores} محركات صاروخية...')
    # هنا الدعسة القصوى: نرسل دفعات كبيرة للمعالج عشان ما يوقف
    with concurrent.futures.ProcessPoolExecutor(max_workers=cores) as executor:
        i = 0
        while i < 1000000000:
            # دفعات من 500 رقم عشان المعالج ما يتنفس
            numbers = range(i, i + 200)
            print(f'\rيهرول ذلحين: {i}', end='')
            results = list(executor.map(check, numbers))
            for res in results:
                if res is not None:
                    print(f'\n\n[+] لقفناه يا وحش! الرمز هو: {res}')
                    exit()
            i += 3000
