fetch(
    "https://ap-southeast-1.aws.services.cloud.mongodb.com/api/client/v2.0/app/data-xpnawsg/auth/providers/anon-user/login",
    {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
    }
)
    .then((response) => response.json())
    .then((data) => {
        const accessToken = data.access_token;
        console.log("Access Token:", accessToken);

        let myHeaders = new Headers();
        myHeaders.append("Accept", "application/json");
        myHeaders.append("Authorization", "Bearer " + accessToken);

        var reflowAuth = localStorage.getItem("reflowAuth");
        var parsedReflowAuth = JSON.parse(reflowAuth);
        let raw = JSON.stringify({
            dataSource: "TLB-Kitchen",
            database: "tlb_kitchen_website",
            collection: "blogs"
        });

        let requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: raw,
            redirect: "follow",
        };

        fetch(
            "https://ap-southeast-1.aws.data.mongodb-api.com/app/data-xpnawsg/endpoint/data/v1/action/find",
            requestOptions
        )
            .then((response) => response.text())
            .then((result) => {
                const parsedResult = JSON.parse(result);
                console.log(parsedResult);
                const documents = parsedResult.documents;
                var urlParams = new URLSearchParams(window.location.search);
                var pagenum = urlParams.get("page");
                if (pagenum == null) {
                    pagenum = 1;
                }
                pagenum = parseInt(pagenum);
                let blogsPerPage = 10;
                let start = (pagenum-1) * blogsPerPage;
                let end = start + blogsPerPage;
                console.log(pagenum);
                if (end > documents.length) {
                    end = documents.length;
                }

                for (let i = start; i < end; i++) {
                    const blog = documents[i];
                    console.log(blog);

                    let image = blog.image;
                    let description = blog.description;
                    let time = blog.time;
                    let title = blog.title;
                    let blogId = blog.id;

                    let htmlContent =
                        `<div class="block-content" style="padding-top: 0;margin-top: 0;">
                <div class="clean-blog-post" style="background-color: white;">
                    <div class="row" style="padding: 0 9px 9px;margin-top: 36px;border-radius: 10px;border-width: 0.4px;border-style: solid;">
                        <div class="col-lg-5 col-xl-3 text-center align-self-center" style="border: var(--bs-primary-text-emphasis);"><img class="rounded img-fluid" src="` +
                        image + `" style="height: 200px;margin-top: 19px;margin-bottom: 19px;"></div>
                                <div class="col-lg-7 col-xl-9 text-center text-lg-start text-xl-start text-xxl-start align-self-center">
                                    <h3 style="margin-top: 15px;">` + title + `</h3>
                                    <div class="info"><span class="text-muted">` + time + `</span></div>
                                    <p>` + description + `</p><a class="btn btn-primary" role="button" href="./../../blogpost.html?blog=` +
                        blogId +
                        `" style="margin-bottom: 10px;">Read More</a>
                                </div>
                            </div>
                        </div>`
                    let blogsContainer = document.querySelector(".blogs-content");
                    blogsContainer.innerHTML += htmlContent;
                }

                const totalBlogs = documents.length; // Assuming 'documents' contains all blog entries
                const totalPages = Math.ceil(totalBlogs / blogsPerPage);

                let paginationHtml = `<li class="page-item ${pagenum === 1 ? 'disabled' : ''}"><a class="page-link" href="?page=${pagenum - 1}" aria-label="Previous"><span aria-hidden="true" style="color: var(--bs-body-color);">«</span></a></li>`;

                for (let i = 1; i <= totalPages; i++) {
                    paginationHtml += `<li class="page-item ${i === pagenum ? 'active' : ''}" style="color: var(--bs-body-color);"><a class="page-link" style="color: var(--bs-body-color);" href="?page=${i}">${i}</a></li>`;
                }

                paginationHtml += `<li class="page-item ${pagenum === totalPages ? 'disabled' : ''}"><a class="page-link" href="?page=${pagenum + 1}" aria-label="Next"><span aria-hidden="true" style="color: var(--bs-body-color);">»</span></a></li>`;

                document.querySelector(".page-blogs").innerHTML = paginationHtml;
                $(".loading").hide();

            })
            .catch((e) => {
                console.log(e);
                $(".loading").hide();
            });
    })
    .catch((error) => {
        console.error("An error occurred:", error);
        $(".loading").hide();

    });

document.addEventListener('DOMContentLoaded', function() {

    document.querySelector('.search-blogs').addEventListener('click', search);
    document.querySelector('input[type="text"]').addEventListener('keypress', function(event) {
    if (event.keyCode === 13 || event.which === 13) {
        search();
    }
});
});


function search() {
    $(".loading").show();
    const searchInput = document.querySelector('input[type="text"]');
    let query = searchInput.value.toLowerCase();

    fetch(
        "https://ap-southeast-1.aws.services.cloud.mongodb.com/api/client/v2.0/app/data-xpnawsg/auth/providers/anon-user/login",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
        }
    )
        .then((response) => response.json())
        .then((data) => {
            const accessToken = data.access_token;
            console.log("Access Token:", accessToken);

            let myHeaders = new Headers();
            myHeaders.append("Accept", "application/json");
            myHeaders.append("Authorization", "Bearer " + accessToken);

            var reflowAuth = localStorage.getItem("reflowAuth");
            var parsedReflowAuth = JSON.parse(reflowAuth);

            if (query !== null && query.length > 0 && query !== "") {
                let raw = JSON.stringify({
                    dataSource: "TLB-Kitchen",
                    database: "tlb_kitchen_website",
                    collection: "blogs",
                    pipeline: [
                        {
                            $search: {
                                index: "search",
                                autocomplete: {
                                    query: query,
                                    path: "title"
                                }
                            }
                        }
                    ]
                });

                let requestOptions = {
                    method: "POST",
                    headers: myHeaders,
                    body: raw,
                    redirect: "follow",
                };

                fetch(
                    "https://ap-southeast-1.aws.data.mongodb-api.com/app/data-xpnawsg/endpoint/data/v1/action/aggregate",
                    requestOptions
                )
                    .then((response) => response.text())
                    .then((result) => {
                        const parsedResult = JSON.parse(result);
                        let documents = parsedResult.documents;
                        let end = 10;
                        if (end > documents.length) {
                            end = documents.length;
                        }

                        let blogsContainer = document.querySelector(".blogs-content");
                        blogsContainer.innerHTML = "";
                        for (let i = 0; i < end; i++) {
                            const blog = documents[i];
                            console.log(blog);

                            let image = blog.image;
                            let description = blog.description;
                            let time = blog.time;
                            let title = blog.title;
                            let blogId = blog.id;

                            let htmlContent =
                                `<div class="block-content" style="padding-top: 0;margin-top: 0;">
                    <div class="clean-blog-post" style="background-color: white;">
                        <div class="row" style="padding: 0 9px 9px;margin-top: 36px;border-radius: 10px;border-width: 0.4px;border-style: solid;">
                            <div class="col-lg-5 col-xl-3 text-center align-self-center" style="border: var(--bs-primary-text-emphasis);"><img class="rounded img-fluid" src="` +
                                image + `" style="height: 200px;margin-top: 19px;margin-bottom: 19px;"></div>
                                    <div class="col-lg-7 col-xl-9 text-center text-lg-start text-xl-start text-xxl-start align-self-center">
                                        <h3 style="margin-top: 15px;">` + title + `</h3>
                                        <div class="info"><span class="text-muted">` + time + `</span></div>
                                        <p>` + description + `</p><a class="btn btn-primary" role="button" href="./../../blogpost.html?blog=` +
                                blogId +
                                `" style="margin-bottom: 10px;">Read More</a>
                                    </div>
                                </div>
                            </div>`
                            let blogsContainer = document.querySelector(".blogs-content");
                            blogsContainer.innerHTML += htmlContent;
                        }

                        document.querySelector(".page-blogs").innerHTML = "";
                        $(".loading").hide();
                    })
                    .catch((e) => {
                        console.log(e);
                        $(".loading").hide();
                    });
            } else {
                fetch(
                    "https://ap-southeast-1.aws.services.cloud.mongodb.com/api/client/v2.0/app/data-xpnawsg/auth/providers/anon-user/login",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                    }
                )
                    .then((response) => response.json())
                    .then((data) => {
                        const accessToken = data.access_token;
                        console.log("Access Token:", accessToken);

                        let myHeaders = new Headers();
                        myHeaders.append("Accept", "application/json");
                        myHeaders.append("Authorization", "Bearer " + accessToken);

                        var reflowAuth = localStorage.getItem("reflowAuth");
                        var parsedReflowAuth = JSON.parse(reflowAuth);
                        let raw = JSON.stringify({
                            dataSource: "TLB-Kitchen",
                            database: "tlb_kitchen_website",
                            collection: "blogs"
                        });

                        let requestOptions = {
                            method: "POST",
                            headers: myHeaders,
                            body: raw,
                            redirect: "follow",
                        };

                        fetch(
                            "https://ap-southeast-1.aws.data.mongodb-api.com/app/data-xpnawsg/endpoint/data/v1/action/find",
                            requestOptions
                        )
                            .then((response) => response.text())
                            .then((result) => {
                                const parsedResult = JSON.parse(result);
                                console.log(parsedResult);
                                const documents = parsedResult.documents;
                                var urlParams = new URLSearchParams(window.location.search);
                                var pagenum = urlParams.get("page");
                                if (pagenum == null) {
                                    pagenum = 1;
                                }
                                pagenum = parseInt(pagenum);
                                let blogsPerPage = 10;
                                let start = (pagenum - 1) * blogsPerPage;
                                let end = start + blogsPerPage;
                                console.log(pagenum);
                                if (end > documents.length) {
                                    end = documents.length;
                                }
                                let blogsContainer = document.querySelector(".blogs-content");
                                blogsContainer.innerHTML = "";
                                document.querySelector(".page-blogs").innerHTML = "";

                                for (let i = start; i < end; i++) {
                                    const blog = documents[i];
                                    console.log(blog);

                                    let image = blog.image;
                                    let description = blog.description;
                                    let time = blog.time;
                                    let title = blog.title;
                                    let blogId = blog.id;

                                    let htmlContent =
                                        `<div class="block-content" style="padding-top: 0;margin-top: 0;">
                <div class="clean-blog-post" style="background-color: white;">
                    <div class="row" style="padding: 0 9px 9px;margin-top: 36px;border-radius: 10px;border-width: 0.4px;border-style: solid;">
                        <div class="col-lg-5 col-xl-3 text-center align-self-center" style="border: var(--bs-primary-text-emphasis);"><img class="rounded img-fluid" src="` +
                                        image + `" style="height: 200px;margin-top: 19px;margin-bottom: 19px;"></div>
                                <div class="col-lg-7 col-xl-9 text-center text-lg-start text-xl-start text-xxl-start align-self-center">
                                    <h3 style="margin-top: 15px;">` + title + `</h3>
                                    <div class="info"><span class="text-muted">` + time + `</span></div>
                                    <p>` + description + `</p><a class="btn btn-primary" role="button" href="./../../blogpost.html?blog=` +
                                        blogId +
                                        `" style="margin-bottom: 10px;">Read More</a>
                                </div>
                            </div>
                        </div>`
                                    blogsContainer.innerHTML += htmlContent;
                                }

                                const totalBlogs = documents.length; // Assuming 'documents' contains all blog entries
                                const totalPages = Math.ceil(totalBlogs / blogsPerPage);

                                let paginationHtml = `<li class="page-item ${pagenum === 1 ? 'disabled' : ''}"><a class="page-link" href="?page=${pagenum - 1}" aria-label="Previous"><span aria-hidden="true" style="color: var(--bs-body-color);">«</span></a></li>`;

                                for (let i = 1; i <= totalPages; i++) {
                                    paginationHtml += `<li class="page-item ${i === pagenum ? 'active' : ''}" style="color: var(--bs-body-color);"><a class="page-link" style="color: var(--bs-body-color);" href="?page=${i}">${i}</a></li>`;
                                }

                                paginationHtml += `<li class="page-item ${pagenum === totalPages ? 'disabled' : ''}"><a class="page-link" href="?page=${pagenum + 1}" aria-label="Next"><span aria-hidden="true" style="color: var(--bs-body-color);">»</span></a></li>`;

                                document.querySelector(".page-blogs").innerHTML = paginationHtml;
                                $(".loading").hide();

                            })
                            .catch((e) => {
                                console.log(e);
                                $(".loading").hide();
                            });
                    })
                    .catch((error) => {
                        console.error("An error occurred:", error);
                        $(".loading").hide();

                    });
            }
        })
        .catch((error) => {
            console.error("An error occurred:", error);
            $(".loading").hide();
        });
}