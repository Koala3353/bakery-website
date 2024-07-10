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
                console.log(documents)
            })
            .catch(() => {
            });
    })
    .catch((error) => {
        console.error("An error occurred:", error);

    });