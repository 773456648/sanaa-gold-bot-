import requests
from bs4 import BeautifulSoup
import cloudscraper
from fake_useragent import UserAgent
import re
import time
import random

class FadiCinema:
    def __init__(self):
        self.ua = UserAgent()
        self.scraper = cloudscraper.create_scraper()
        self.results = []
        
    def search_all(self, query):
        self.results = []
        sites = [
            self.search_egybest,
            self.search_faselhd,
            self.search_moviesland,
        ]
        
        for site_func in sites:
            try:
                site_func(query)
                time.sleep(random.uniform(1, 2))
            except:
                continue
        return self.results
    
    def search_egybest(self, query):
        try:
            url = f"https://www.egy.best/search/?q={query.replace(' ', '+')}"
            headers = {'User-Agent': self.ua.random}
            response = self.scraper.get(url, headers=headers, timeout=10)
            soup = BeautifulSoup(response.text, 'html.parser')
            for item in soup.select('.movie-card')[:3]:
                title = item.select_one('.title')
                if title:
                    movie_url = item.get('href')
                    if movie_url:
                        self.results.append({
                            'title': title.text.strip(),
                            'url': movie_url if movie_url.startswith('http') else f"https://www.egy.best{movie_url}",
                            'site': 'ايجي بست',
                            'quality': 'HD',
                            'type': 'فيلم'
                        })
        except:
            pass
    
    def search_faselhd(self, query):
        try:
            url = f"https://www.faselhd.best/search?q={query.replace(' ', '%20')}"
            headers = {'User-Agent': self.ua.random}
            response = self.scraper.get(url, headers=headers, timeout=10)
            soup = BeautifulSoup(response.text, 'html.parser')
            for item in soup.select('.post')[:3]:
                link = item.select_one('a')
                if link and link.get('href'):
                    self.results.append({
                        'title': link.get('title', 'فيلم'),
                        'url': link.get('href') if link.get('href').startswith('http') else f"https://www.faselhd.best{link.get('href')}",
                        'site': 'فاصل إعلاني',
                        'quality': 'HD',
                        'type': 'فيلم'
                    })
        except:
            pass
    
    def search_moviesland(self, query):
        try:
            url = f"https://moviesland.online/search/{query.replace(' ', '%20')}"
            headers = {'User-Agent': self.ua.random}
            response = self.scraper.get(url, headers=headers, timeout=10)
            soup = BeautifulSoup(response.text, 'html.parser')
            for item in soup.select('.movie-item')[:3]:
                title = item.select_one('.movie-title')
                link = item.select_one('a')
                if title and link:
                    self.results.append({
                        'title': title.text.strip(),
                        'url': link.get('href'),
                        'site': 'موفيز لاند',
                        'quality': 'HD',
                        'type': 'فيلم'
                    })
        except:
            pass
    
    def get_download_links(self, movie_url):
        try:
            headers = {'User-Agent': self.ua.random}
            response = self.scraper.get(movie_url, headers=headers, timeout=10)
            soup = BeautifulSoup(response.text, 'html.parser')
            links = []
            download_patterns = [r'https?://[^\s]*\.(mp4|mkv|avi|m3u8)']
            for pattern in download_patterns:
                found_links = re.findall(pattern, response.text)
                for link in found_links[:2]:
                    links.append({'url': link, 'quality': 'مشاهدة مباشرة'})
            iframes = soup.find_all('iframe')
            for iframe in iframes:
                src = iframe.get('src')
                if src and src.startswith('http'):
                    links.append({'url': src, 'quality': 'مشاهدة'})
            return links[:5]
        except:
            return []
