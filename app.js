
// app.js : 살아 움직이는 영화 보드 / 김재호(26)

// 1. 찜한 영화 배열 불러오기
const liked = JSON.parse(localStorage.getItem("liked") || "[]");

// 찜한 영화 저장
function saveLiked() {
    localStorage.setItem("liked", JSON.stringify(liked));
}

// 2. 포스터 주소 만들기
function posterUrl(path, size) {
    return "https://image.tmdb.org/t/p/" + size + path;
}

// 3. 영화 검색
function search(list, keyword) {
    const word = keyword.trim().toLowerCase();

    return list.filter(m =>
        m.title.toLowerCase().includes(word)
    );
}

// 4. 영화 정렬
function sortBy(list, key, desc) {
    const copy = [...list];

    copy.sort((a, b) => {
        if (typeof a[key] === "string") {
            return a[key].localeCompare(b[key]);
        }

        return a[key] - b[key];
    });

    if (desc) {
        copy.reverse();
    }

    return copy;
}

// 5. 검색, 보기 필터, 정렬을 함께 처리
function getView() {

    // 검색어
    const keyword = document.getElementById("q").value;

    // 보기 필터
    const type = document.querySelector(
        'input[name="type"]:checked'
    ).value;

    // 정렬 기준
    const key = document.getElementById("sort").value;

    // 검색
    let result = search(movies, keyword);

    // 보기 필터
    if (type !== "all") {
        result = result.filter(m => m.type === type);
    }

    // 정렬
    result = sortBy(result, key, key !== "title");

    return result;
}

// 6. 영화 카드 생성
function renderCards(list) {

    const board = document.getElementById("board");

    board.innerHTML = "";

    for (const m of list) {

        const card = document.createElement("article");

        card.className = "card";

        // 데이터 속성
        card.setAttribute("data-type", m.type);
        card.setAttribute("data-title", m.title);

        // 평점 8점 이상
        if (m.rating >= 8) {
            card.classList.add("hot");
        }

        // 박스오피스 순위
        const rank = m.type === "boxoffice"
            ? `<span class="rank">${m.rank}위</span>`
            : "";

        // 포스터
        const poster = m.poster
            ? `<img class="poster"
                src="${posterUrl(m.poster, "w342")}"
                alt="${m.title} 포스터">`
            : `<div class="poster-fallback">${m.title[0]}</div>`;

        // 좋아요 상태
        const isLiked = liked.includes(m.title);

        card.innerHTML = `
            ${poster}

            ${rank}

            <span class="badge">${m.rating}</span>

            <div class="info">
                <h3>${m.title}</h3>
                <p>${m.year}</p>

                <button
                    type="button"
                    class="like ${isLiked ? "liked" : ""}"
                    aria-label="찜하기"
                >♥</button>
            </div>
        `;

        board.appendChild(card);
    }

    // 영화 개수 표시
    document.getElementById("count").textContent =
        list.length + "편";

    // 찜 개수 표시
    document.getElementById("likeCount").textContent =
        liked.length;

    // 빈 결과 표시
    if (list.length === 0) {
        board.classList.add("is-empty");
    } else {
        board.classList.remove("is-empty");
    }
}

// 7. 화면 새로고침 함수
function refresh() {
    renderCards(getView());
}

// 8. 상세 정보 열기
function openDetail(title) {

    const movie = movies.find(m => m.title === title);

    if (!movie) {
        return;
    }

    const detailBody = document.getElementById("detailBody");

    const poster = movie.poster
        ? `<img src="${posterUrl(movie.poster, "w500")}"
            alt="${movie.title} 포스터">`
        : "";

    const overview = movie.overview
        ? movie.overview
        : "줄거리 정보가 없습니다.";

    detailBody.innerHTML = `
        ${poster}

        <h2>${movie.title}</h2>

        <p>개봉일 ${movie.date}</p>

        <p>평점 ${movie.rating}</p>

        <p>${overview}</p>
    `;

    document.getElementById("detail").showModal();
}

// 9. 검색 이벤트
document.getElementById("q").addEventListener("input", refresh);

// 10. 정렬 이벤트
document.getElementById("sort").addEventListener("change", refresh);

// 11. 보기 필터 이벤트
document.getElementById("typeFilter").addEventListener("change", refresh);

// 12. 보드 클릭 이벤트 위임
document.getElementById("board").addEventListener("click", (e) => {

    // 찜 버튼을 눌렀는지 확인
    if (e.target.closest(".like")) {

        const button = e.target.closest(".like");

        const card = button.closest(".card");

        const title = card.getAttribute("data-title");

        const i = liked.indexOf(title);

        // 이미 찜한 영화라면 제거
        if (i >= 0) {
            liked.splice(i, 1);
        }

        // 찜하지 않은 영화라면 추가
        else {
            liked.push(title);
        }

        // 저장 및 화면 갱신
        saveLiked();
        refresh();

        return;
    }

    // 카드 찾기
    const card = e.target.closest(".card");

    if (!card) {
        return;
    }

    // 카드 제목 가져오기
    const title = card.getAttribute("data-title");

    // 상세 정보 열기
    openDetail(title);
});

// 13. 상세 창 닫기
document.getElementById("closeDetail").addEventListener("click", () => {
    document.getElementById("detail").close();
});

// 14. 처음 화면 렌더링
refresh();
