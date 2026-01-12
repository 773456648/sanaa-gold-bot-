import pyzipper
file_path = "10_sign.zip"
with pyzipper.AESZipFile(file_path) as z:
    for i in range(01111, 1000000000):
        if i % 10 == 0:
            print(f"\rيهرول: {i}", end="")
        try:
            z.extractall(pwd=str(i).encode())
            print(f"\n\n[+] لقفناه! الرمز هو: {i}")
            break
        except: pass
