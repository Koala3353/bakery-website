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

        let raw = JSON.stringify({
            dataSource: "TLB-Kitchen",
            database: "tlb_kitchen_website",
            collection: "pastries",
            filter: {
                "spec_id": "categories"
            }
        });

        let requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: raw,
            redirect: "follow",
        };

        var urlParams = new URLSearchParams(window.location.search);
        var categoryNum = urlParams.get("category");
        categoryNum = parseInt(categoryNum);
        if (categoryNum == null) {
            categoryNum = -1;
        }
        fetch(
            "https://ap-southeast-1.aws.data.mongodb-api.com/app/data-xpnawsg/endpoint/data/v1/action/findOne",
            requestOptions
        )
            .then((response) => response.text())
            .then((result) => {
                const parsedResult = JSON.parse(result);
                console.log(parsedResult);
                const docs = parsedResult.document;
                let categories = docs.categories;
                console.log(categories);

                for (let i = 0; i < categories.length; i++) {
                    let category = categories[i];
                    let id = i.toString();
                    let htmlContent = `<a class="dropdown-item ${i === categoryNum ? 'active' : ''}" href="../../pastries.html?category=` + id + `">` + category + `</a>`;
                    let dropdownMenu = document.querySelector(".categories-dropdown");
                    dropdownMenu.innerHTML += htmlContent; // Use += to append each category
                }



                // GET THE CONTENT

                let categoryName = categories[categoryNum];
                let categoryFilter = "";
                if (categoryNum !== -1) {
                    categories = [categoryName]
                }

                for (let i = 0; i < categories.length; i++) {
                    let category = categories[i];
                    let htmlContent = `<div class="row">
                        <div class="col">
                            <h1 class="text-center" style="font-family: Lobster, serif;padding-bottom: 0px;margin-bottom: 26px;">` + category + `</h1>
                        </div>
                    </div>`;
                    let header = document.querySelector(".pastries-db");
                    header.innerHTML += htmlContent; // Use += to append each category

                    categoryFilter = {category: category};


                    // INDIVIDUAL STUFF
                    let itemsToAddHTML = `<div class="row gy-3 row-cols-1 row-cols-md-2 row-cols-xl-3">`;

                    let raw2 = JSON.stringify({
                        dataSource: "TLB-Kitchen",
                        database: "tlb_kitchen_website",
                        collection: "pastries",
                        filter: categoryFilter

                    });
                    console.log(raw2);

                    let requestOptions2 = {
                        method: "POST",
                        headers: myHeaders,
                        body: raw2,
                        redirect: "follow",
                    };

                    fetch(
                        "https://ap-southeast-1.aws.data.mongodb-api.com/app/data-xpnawsg/endpoint/data/v1/action/find",
                        requestOptions2
                    )
                        .then((response) => response.text())
                        .then((result) => {
                            const parsedResult = JSON.parse(result);
                            console.log(parsedResult);
                            const docs = parsedResult.documents;

                            for (let z = 0; z < docs.length; z++) {
                                let item = docs[z];
                                let title = item.title;
                                let picture = item.picture;
                                itemsToAddHTML += `<div class="col-6 col-md-4 col-lg-3 col-xl-3">
                    <div class="text-center"><a href="#" data-bs-target="#pictureModal${i}-${z}" data-bs-toggle="modal"><img class="rounded img-fluid fit-cover" style="height: 200px;width: 200px;" src="${picture}" width="330" height="400"></a>
                        <div class="py-2">
                            <h6 class="text-center">${title}</h6>
                        </div>
                    </div>
                </div>`;
                            }
                            document.querySelector(".pastries-db").innerHTML += itemsToAddHTML + `</div>`;
                        })
                }
            })
            .catch((e) => {
                console.log(e);
            });
    })
    .catch((error) => {
        console.error("An error occurred:", error);

    });