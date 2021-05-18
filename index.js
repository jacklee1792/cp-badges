import badgen from 'badgen';
import express from 'express';
import rateLimit from 'express-rate-limit';
import https from 'https';

const getDmojRating = (username) => new Promise((resolve, reject) => {
  const options = {
    hostname: 'dmoj.ca',
    path: `/api/v2/user/${username}`,
    method: 'GET'
  }
  const req = https.request(options, res => {
    res.setEncoding('utf-8');
    var body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
      try {
        const rating = JSON.parse(body).data.object.rating;
        resolve(rating);
      }
      catch(err) {
        resolve(undefined);
      }
    });
  });
  req.on('error', err => {
    reject(err);
  });
  req.end();
});

const getCodeforcesRating = (username) => new Promise((resolve, reject) => {
  const options = {
    hostname: 'codeforces.com',
    path: `/api/user.info?handles=${username}`,
    method: 'GET'
  }
  const req = https.request(options, res => {
    res.setEncoding('utf-8');
    var body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
      try {
        const rating = JSON.parse(body).result[0].rating;
        resolve(rating);
      }
      catch(err) {
        resolve(undefined);
      }
    })
  });
  req.on('error', err => {
    reject(err);
  });
  req.end();
});

const getDmojColor = (rating) => {
  if (typeof rating == 'undefined' || rating < 1000) {
    return 'grey';
  } else if (rating < 1200) {
    return 'green';
  } else if (rating < 1500) {
    return 'blue';
  } else if (rating < 1800) {
    return 'purple';
  } else if (rating < 2200) {
    return 'yellow';
  } else if (rating < 3000) {
    return 'red';
  } else {
    return 'black';
  }
}

const getCodeforcesColor = (rating) => {
  if (typeof rating == 'undefined' || rating < 1200) {
    return 'grey';
  } else if (rating < 1400) {
    return 'green';
  } else if (rating < 1600) {
    return 'cyan';
  } else if (rating < 1900) {
    return 'blue';
  } else if (rating < 2100) {
    return 'purple';
  } else if (rating < 2300) {
    return 'yellow';
  } else if (rating < 2400) {
    return 'orange';
  } else if (rating < 2600) {
    return 'red';
  } else if (rating < 3000) {
    return 'A31C0F';
  } else {
    return 'black';
  }
}

const app = express();

// 10 DMOJ requests per IP per minute
app.use('/dmoj/', rateLimit({
  windowMs: 60 * 1000,
  max: 10
}));
// 90 DMOJ requests per minute across all IPs
app.use('/dmoj/', rateLimit({
  windowMs: 60 * 1000,
  max: 90,
  keyGenerator: () => 0
}));

// 10 Codeforces requests per IP per minute
app.use('/codeforces/', rateLimit({
  windowMs: 60 * 1000,
  max: 10
}));
// 5 Codeforces requests per second across all IPs
app.use('/codeforces/', rateLimit({
  windowMs: 1000,
  max: 5,
  keyGenerator: () => 0
}));

const dmojLogo = 'PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MTIiIGhlaWdodD0iNTEyIj48ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMzkuMDUgMTQxLjU0KSI+PGVsbGlwc2UgY3g9IjI5NS4wNSIgY3k9IjExNC40NiIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjQzLjk4IiByeD0iMjM0LjAxIiByeT0iMjM0LjAxIi8+PHBhdGggZmlsbD0iI2ZjZGIwNSIgc3Ryb2tlPSIjZmNkYjA1IiBzdHJva2Utd2lkdGg9IjEwLjEiIGQ9Ik0yOTIuMTUtOTcuODdjLTEwOC45LjI1LTIxOCA5My4yNC0yMDguNzMgMjI5Ljg4IDIuNjQgMzguOTIgMTguMDQgNzkuMDUgNDQuMDggMTEyLjcyIDM5Ljc0IDUxLjQgMTA0LjI2IDg3LjczIDE4Ni4wMyA4MS43NiAxMDIuNDYtNy40OSAxOTYuMzQtOTYuNDUgMTk0LjMtMjE1Ljg4LTEuOTctMTE1LjgtOTguNy0yMTAuODMtMjE1LjY4LTIwOC40OG0zLjU3IDQ0MS44MUMxNzAuODkgMzQ1Ljk2IDY0Ljk4IDI0MC4xIDY1Ljg1IDExNC4xMWMuODctMTI3LjIgMTA0LjE5LTIzMC42MiAyMzEuNjMtMjI4Ljg1IDEyNS44MiAxLjc1IDIyOC4wNiA5OS43NiAyMjcuMTYgMjMzLjE1LS44MiAxMjMuNDYtMTAyLjA5IDIyNS44NC0yMjguOTEgMjI1LjUzIi8+PHBhdGggZmlsbD0iI2ZjZGIwNSIgZD0iTTMyOS44OCAxMjUuNTRjMTQuNTkgMjAuNDMgMzEuNjQgMzguMTkgNDcuOCA1Ni42NCAxOC4zOCAyMC45OCAxOC42MyAyMC42NC0zLjg3IDM2LjQzYTMyMy4xMyAzMjMuMTMgMCAwIDAtMjEuMDkgMTYuMDNjLTYuMzMgNS4yNi0xMC42MSA2LjQ0LTE1LjItMi40OC0xMi45Mi0yNS4wOS00My42LTc4LjA0LTQ2LjQ5LTc3LjUyLTIuNzUuNS0zMi43NSA1My42NC00Ni44MSA3OC4xOC00LjYxIDguMDUtOC4xMiA2Ljk5LTE0LjI2IDEuOTctMTAuOS04LjkzLTIyLjAzLTE3Ljc2LTMzLjkxLTI1LjMtNy41OC00LjgtNy42Ni04LjE2LTIuMS0xNC4zNCAxOC40MS0yMC40NyA1Ny42OC02Ni4xMyA2MC02OS40LTI5LjA3LTYuMDQtNTYuOTQtMTItODQuODgtMTcuNTQtMTAuNDctMi4wOC0xMy45Mi00LjQ1LTkuMy0xNi45NiA0LjM3LTExLjc3IDEwLjQ2LTIzLjYyIDExLjY4LTM2LjQgMS4wOC0xMS4zIDYuNDctMTEuNSAxNC42Mi03LjgzIDI1LjAzIDExLjI3IDc4LjQgMzUgODEuNDIgMzUuOTQgMS4wOC0yMS4zNC03LjMtODAuNy04LjcyLTg5LjktMS4wMy02Ljc2IDEuMi05LjUzIDguNTgtOS4yNSAxNC43OS41NSAyOS42NyAxLjA4IDQ0LjM4LS4xNCAxMS4zNy0uOTQgMTMuMTcgNC4yMSAxMS41MyAxMy4wOC01LjIyIDI4LjE2LTUuNTggNTYuNzMtNy44MyA4Ni43IDI2LjExLTExLjQ0IDUxLjY0LTIyIDc2LjU5LTMzLjggMTQuMTQtNi42OCAxNi41Mi02LjM3IDIwLjAyIDguMDUgMi45MiAxMi4wMiA3LjYgMjMuNiAxMS41OCAzNS4yNCA0LjE1IDEyLjEzLTEuNSAxMy40MS05LjkyIDE1LjE2LTI3LjYxIDUuNzItNTUuMjIgMTEuNS04My44MiAxNy40NiIvPjwvZz48L3N2Zz4=';
const codeforcesLogo = 'PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAyMy4wLjUsIFNWRyBFeHBvcnQgUGx1Zy1JbiAuIFNWRyBWZXJzaW9uOiA2LjAwIEJ1aWxkIDApICAtLT4NCjxzdmcgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCINCgkgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldzsiIHhtbDpzcGFjZT0icHJlc2VydmUiPg0KPHN0eWxlIHR5cGU9InRleHQvY3NzIj4NCgkuc3Qwe2ZpbGw6dXJsKCNTVkdJRF8xXyk7fQ0KCS5zdDF7ZmlsbDp1cmwoI1NWR0lEXzJfKTt9DQoJLnN0MntmaWxsOnVybCgjU1ZHSURfM18pO30NCgkuc3Qze2ZpbGw6IzQyNUU5Qzt9DQo8L3N0eWxlPg0KPGc+DQoJPGc+DQoJCTxsaW5lYXJHcmFkaWVudCBpZD0iU1ZHSURfMV8iIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIiB4MT0iMCIgeTE9Ijc0LjA4MzQiIHgyPSIzOS4zNzU1IiB5Mj0iNzQuMDgzNCI+DQoJCQk8c3RvcCAgb2Zmc2V0PSIwIiBzdHlsZT0ic3RvcC1jb2xvcjojRjZDNDNEIi8+DQoJCQk8c3RvcCAgb2Zmc2V0PSIxIiBzdHlsZT0ic3RvcC1jb2xvcjojRkNEOTc1Ii8+DQoJCTwvbGluZWFyR3JhZGllbnQ+DQoJCTxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik0zMC4zLDMyLjdIOWMtNSwwLTksNC4xLTksOXY2NC43YzAsNSw0LjEsOSw5LDloMjEuM2M1LDAsOS00LjEsOS05VjQxLjdDMzkuNCwzNi43LDM1LjMsMzIuNywzMC4zLDMyLjd6Ii8+DQoJCTxsaW5lYXJHcmFkaWVudCBpZD0iU1ZHSURfMl8iIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIiB4MT0iNTQuMjUyNiIgeTE9IjU3Ljc0NjEiIHgyPSI5My42MjgyIiB5Mj0iNTcuNzQ2MSI+DQoJCQk8c3RvcCAgb2Zmc2V0PSIwIiBzdHlsZT0ic3RvcC1jb2xvcjojMTQ4MEM0Ii8+DQoJCQk8c3RvcCAgb2Zmc2V0PSIxIiBzdHlsZT0ic3RvcC1jb2xvcjojMUM5OUQ0Ii8+DQoJCTwvbGluZWFyR3JhZGllbnQ+DQoJCTxwYXRoIGNsYXNzPSJzdDEiIGQ9Ik04NC42LDBINjMuM2MtNSwwLTksNC4xLTksOXY5Ny40YzAsNSw0LjEsOSw5LDloMjEuM2M1LDAsOS00LjEsOS05VjlDOTMuNiw0LjEsODkuNiwwLDg0LjYsMHoiLz4NCgkJPGxpbmVhckdyYWRpZW50IGlkPSJTVkdJRF8zXyIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiIHgxPSIxMDguMzY4MyIgeTE9IjgwLjI4MjciIHgyPSIxNDcuNzQzOCIgeTI9IjgwLjI4MjciPg0KCQkJPHN0b3AgIG9mZnNldD0iMCIgc3R5bGU9InN0b3AtY29sb3I6I0IxMUUyNiIvPg0KCQkJPHN0b3AgIG9mZnNldD0iMSIgc3R5bGU9InN0b3AtY29sb3I6I0MyMUMyNCIvPg0KCQk8L2xpbmVhckdyYWRpZW50Pg0KCQk8cGF0aCBjbGFzcz0ic3QyIiBkPSJNMTM4LjcsNDUuMWgtMjEuM2MtNSwwLTksNC4xLTksOXY1Mi4zYzAsNSw0LjEsOSw5LDloMjEuM2M1LDAsOS00LjEsOS05VjU0LjENCgkJCUMxNDcuNyw0OS4xLDE0My43LDQ1LjEsMTM4LjcsNDUuMXoiLz4NCgk8L2c+DQo8L2c+DQo8L3N2Zz4NCg==';

app.get('/dmoj/:username', (req, res) => {
  res.setHeader('content-type', 'image/svg+xml');
  getDmojRating(req.params.username)
    .then(rating => {
      const svgString = badgen.badgen({
        label: 'DMOJ',
        status: rating ? rating.toString() : 'unrated',
        color: getDmojColor(rating),
        icon: 'data:image/svg+xml;base64,' + dmojLogo,
      });
      res.send(svgString);
    });
});

app.get('/codeforces/:username', (req, res) => {
  res.setHeader('content-type', 'image/svg+xml');
  getCodeforcesRating(req.params.username)
    .then(rating => {
      const svgString = badgen.badgen({
        label: 'Codeforces',
        status: rating ? rating.toString() : 'unrated',
        color: getCodeforcesColor(rating),
        icon: 'data:image/svg+xml;base64,' + codeforcesLogo,
        iconWidth: 15
      });
      res.send(svgString);
    });
});

app.listen(80);
