
        $(document).ready(function() {
            $('#resultsTable').DataTable({
                dom: 'Bfrtip',
                buttons: [
                    'copy', 'csv', 'excel', 'pdf', 'print'
                ]
            });
        });

        function searchElasticsearch() {
            // Show the loader
            document.getElementById('loader').style.display = 'block';

            const fromDate = document.getElementById('fromDate').value;
            const toDate = document.getElementById('toDate').value;
            let username = document.getElementById('userName').value;
            // if(username == "" || username == null){
            //     username = "*";
            // }

            // Convert the selected date range to IST (Indian Standard Time)
            const fromIST = new Date(fromDate);
            fromIST.setUTCHours(18, 30, 0, 0);
            // fromIST.setUTCHours(0, 0, 0, 0);
            const toIST = new Date(toDate);
            toIST.setUTCHours(18, 29, 29, 29);
            // toIST.setUTCHours(23, 59, 59, 999);

            
            // Format the adjusted dates as ISO date strings (UTC)
            const fromISO = fromIST.toISOString();
            const toISO = toIST.toISOString();

            console.log(fromISO);
            console.log(toISO);
            // Construct the Elasticsearch query based on user input
            // const query = {
            //     "_source": ["metadataInfo.programId", "lastReviewedBy", "collectedDateTime", "metadataInfo.collector",
            //     "rejectedReasonText", "status", "metadataInfo.collectorMarket", "metadataInfo.imageType",
            //     "metadataInfo.provider.name","lastReviewedDateTime"],
            //     "size": 10000,
            //     "query": {
            //         "bool": {
            //             "must": [
            //                 {
            //                     "match": {
            //                         "status": "REJECTED"
            //                     }
            //                 },
            //                 {
            //                     "range": {
            //                         "lastReviewedDateTime": {
            //                             "gte": `${fromISO}||-1d`,
            //                             // "gte": fromISO,
            //                             "lte": toISO
            //                         }
            //                     }
            //                 }
            //             ]
            //         }
            //     }
            // };
            const query = {
                "_source": [
                    "metadataInfo.programId",
                    "lastReviewedBy",
                    "collectedDateTime",
                    "metadataInfo.collector",
                    "rejectedReasonText",
                    "status",
                    "metadataInfo.collectorMarket",
                    "metadataInfo.imageType",
                    "metadataInfo.provider.name",
                    "lastReviewedDateTime",
                    "metadataInfo.collector"
                ],
                "size": 10000,
                "query": {
                    "bool": {
                    "must": [],
                    "filter": [
                        {
                        "match_all": {}
                        },
                        
                        // {
                        //     "bool": {
                        //         "should": [
                        //             {
                        //                 "wildcard": {
                        //                     "metadataInfo.collector": `${username}`
                        //                 }
                        //             },
                        //             {
                        //                 "wildcard": {
                        //                     "lastReviewedBy": `${username}`
                        //                 }
                        //             }
                        //         ],
                        //         "minimum_should_match": 1
                        //     }
                        // },
                        {
                        "match_phrase": {
                            "status.keyword": "REJECTED"
                        }
                        },
                        {
                        "range": {
                            "lastReviewedDateTime": {
                            "gte": `${fromISO}||-1d`,
                            "lte": toISO
                            }
                        }
                        }
                    ],
                    "should": [],
                    "must_not": []
                    }
                },
            sort: [
                {
                    lastReviewedDateTime: {
                    order: 'asc', // or 'desc' for descending order
                },
                },
            ]
            }

            console.log(query);
            // Convert the query to a string
            const queryString = JSON.stringify(query);

            // Define the Elasticsearch API endpoint URL (replace with your actual URL)
            // const apiUrl = 'https://your-elasticsearch-api-url/tracking/_search';
            const apiUrl = 'https://vpc-rich-media-asset-tracking-2frpn642rs3rc2m2ffqejfchey.us-west-2.es.amazonaws.com/tracking/_search';

            // Send a Fetch request to Elasticsearch
            fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: queryString
            })
            .then(response => response.json())
            .then(data => {
                let newdata = [];
                // Handle the response and display results in the DataTable
                $('#resultsTable').DataTable().clear().destroy();
                $('#resultsTable tbody').empty();
                console.log(data);
                const main_data = data.hits.hits
                if(username){
                    newdata = main_data.filter((data) => {
                        let collector = data._source.metadataInfo.collector
                        let processor = data._source.lastReviewedBy
                        return collector === username || processor === username;
                    })
                }else{
                    newdata = main_data
                }
                for (const hit of newdata) {

                    // Convert timestamps to IST
            const lastReviewedIST = new Date(hit._source.lastReviewedDateTime).toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
            const collectedIST = new Date(hit._source.collectedDateTime).toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });

                    $('#resultsTable tbody').append(
                        '<tr>' +
                        '<td>' + hit._source.metadataInfo.programId + '</td>' +
                        '<td>' + lastReviewedIST + '</td>' +
                        '<td>' + hit._source.lastReviewedBy + '</td>' +
                        '<td>' + collectedIST + '</td>' +
                        '<td>' + hit._source.metadataInfo.collector + '</td>' +
                        '<td>' + hit._source.rejectedReasonText + '</td>' +
                        '<td>' + hit._source.status + '</td>' +
                        '<td>' + hit._source.metadataInfo.collectorMarket + '</td>' +
                        '<td>' + hit._source.metadataInfo.imageType + '</td>' +
                        '<td>' + hit._source.metadataInfo.provider.name + '</td>' +
                        '</tr>'
                    );
                }

                // Hide the loader
                document.getElementById('loader').style.display = 'none';
                // Show the table
                document.getElementById('main_table').style.display = 'block';

                $('#resultsTable').DataTable({
                    dom: 'Bfrtip',
                    order: [[1, 'asc']],
                    buttons: [
                        'copy', 'csv', 'excel', 'pdf', 'print'
                    ],
                    lengthMenu: [ [10, 25, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000], [10, 25, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000] ],
                    pageLength: 100 // Initial page length
                });
            })
            .catch(error => console.error('Error:', error));
        }