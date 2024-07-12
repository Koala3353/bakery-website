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
        if (categoryNum == null) {
            categoryNum = parseInt(categoryNum);
            categoryNum = -1;
        }
        categoryNum = parseInt(categoryNum);

        fetch(
            "https://ap-southeast-1.aws.data.mongodb-api.com/app/data-xpnawsg/endpoint/data/v1/action/findOne",
            requestOptions
        )
            .then((response) => response.text())
            .then(async (result) => {
                const parsedResult = JSON.parse(result);
                const docs = parsedResult.document;
                let categories = docs.categories;

                var pagenum = urlParams.get("page");
                if (pagenum == null) {
                    pagenum = 1;
                }

                pagenum = parseInt(pagenum);
                let pastriesPerPage = 24;
                let start = (pagenum-1) * pastriesPerPage;
                let end = start + pastriesPerPage;
                if (end > pastriesPerPage.length) {
                    end = pastriesPerPage.length;
                }


                for (let i = 0; i < categories.length; i++) {
                    let category = categories[i];
                    let id = i.toString();
                    let htmlContent = `<a class="dropdown-item ${i === categoryNum ? 'active' : ''}" href="../../pastries.html?category=` + id + `">` + category + `</a>`;
                    let dropdownMenu = document.querySelector(".categories-dropdown");
                    dropdownMenu.innerHTML += htmlContent; // Use += to append each category
                }

                // GET THE CONTENT

                let categoryFilter = "";
                if (categoryNum !== -1) {
                    let categoryName = categories[categoryNum];
                    categories = [categoryName]

                }

                let modalContent = "";

                let count = 0;

                for (let i = 0; i < categories.length; i++) {
                        let category = categories[i];

                        categoryFilter = {category: category, type: "item"};


                        // INDIVIDUAL STUFF
                        let itemsToAddHTML = "";

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

                        await fetch(
                            "https://ap-southeast-1.aws.data.mongodb-api.com/app/data-xpnawsg/endpoint/data/v1/action/find",
                            requestOptions2
                        )
                            .then((response) => response.text())
                            .then((result) => {
                                const parsedResult = JSON.parse(result);
                                const docs = parsedResult.documents;

                                let placeTitle = false;
                                for (let z = 0; z < docs.length; z++) {

                                    if (count >= start && count < end) {
                                        if (!placeTitle) {
                                            let htmlContent = `<div class="row">
                                                <div class="col">
                                                    <h1 class="text-center" style="font-family: Lobster, serif;padding-bottom: 0px;margin-bottom: 26px;">` + category + `</h1>
                                                </div>
                                            </div>`;
                                            let header = document.querySelector(".pastries-db");
                                            header.innerHTML += htmlContent; // Use += to append each category
                                            itemsToAddHTML = `<div class="row gy-3 row-cols-1 row-cols-md-2 row-cols-xl-3">`;
                                            console.log("Placing title");
                                            placeTitle = true;
                                        }
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
                                        modalContent += `<div id="pictureModal${i}-${z}" class="modal fade" role="dialog" tabindex="-1" aria-labelledby="pictureModalLabel" aria-hidden="true">
                                                    <div class="modal-dialog modal-dialog-centered" role="document">
                                                        <div class="modal-content">
                                                            <div class="modal-header"><button class="btn-close" aria-label="Close" data-bs-dismiss="modal" type="button"></button></div>
                                                            <div class="modal-body" style="align-self: center"><img class="img-fluid" alt="Picture" src="${picture}" /></div>
                                                        </div>
                                                    </div>
                                                </div>`;
                                    }

                                    count++;
                                }
                                document.querySelector(".pastries-db").innerHTML += itemsToAddHTML + `</div>`;

                            })
                            .catch((error) => {
                                console.error("An error occurred:", error);
                                $(".loading").hide();
                            });

                        document.querySelector(".pastries-db").innerHTML += modalContent;

                    }

                let paginationHtml = `<li class="page-item ${pagenum === 1 ? 'disabled' : ''}"><a class="page-link" href="?page=${pagenum - 1}${categoryNum!==-1 ? "&category=" + categoryNum : ""}" aria-label="Previous"><span aria-hidden="true" style="color: var(--bs-body-color);">«</span></a></li>`;

                let totalPages = Math.ceil(count / pastriesPerPage);
                for (let i = 1; i <= totalPages; i++) {
                    paginationHtml += `<li class="page-item ${i === pagenum ? 'active' : ''}" style="color: var(--bs-body-color);"><a class="page-link" style="color: var(--bs-body-color);" href="?page=${i}${categoryNum!==-1 ? "&category=" + categoryNum : ""}">${i}</a></li>`;
                }

                paginationHtml += `<li class="page-item ${pagenum === totalPages ? 'disabled' : ''}"><a class="page-link" href="?page=${pagenum + 1}${categoryNum!==-1 ? "&category=" + categoryNum : ""}" aria-label="Next"><span aria-hidden="true" style="color: var(--bs-body-color);">»</span></a></li>`;

                document.querySelector(".pagination-pastries").innerHTML = paginationHtml;
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