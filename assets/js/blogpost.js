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
        var urlParams = new URLSearchParams(window.location.search);
        var blogId = urlParams.get("blog");
        let raw = JSON.stringify({
            dataSource: "TLB-Kitchen",
            database: "tlb_kitchen_website",
            collection: "blogs",
            filter: {
                "id": blogId
            }
        });

        let requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: raw,
            redirect: "follow",
        };

        fetch(
            "https://ap-southeast-1.aws.data.mongodb-api.com/app/data-xpnawsg/endpoint/data/v1/action/findOne",
            requestOptions
        )
            .then((response) => response.text())
            .then((result) => {
                const parsedResult = JSON.parse(result);
                console.log(parsedResult);
                const blogPost = parsedResult.document;
                const title = blogPost.title;
                const content = blogPost.content;

                let htmlContent =
                    `<h1 class="fw-bold blog-title" style="font-family: Lobster, serif;">` + title + `</h1>`
                let blogsContainer = document.querySelector(".blog-title");
                blogsContainer.innerHTML = htmlContent;

                document.querySelector(".blog-content").innerHTML =
                    `<p class="blog-content" style="text-align: justify;>` + content + `</p>`;
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