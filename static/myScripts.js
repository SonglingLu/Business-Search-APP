var name_col = 0
var rating_col = 0
var dist_col = 0

function clearPage() {
    resetForm()
    var search_results = document.getElementById("search_results")
    search_results.innerHTML = ""
    var detail_results = document.getElementById("detail_results")
    detail_results.innerHTML = ""
}

function resetForm() {
    var loc = document.getElementById("loc")
    if (loc.disabled) {
        loc.removeAttribute('disabled')
    }
    document.getElementById("form").reset();
}

function alterLocation() {
    var loc = document.getElementById("loc")
    var auto_detect = document.getElementById("auto-detect")
    if (auto_detect.checked == true) {
        loc.value = null
        loc.setAttribute('disabled', '')
    }
    else {
        loc.removeAttribute('disabled')
    }
}

function search() {
    var keyword = document.getElementById("keyword").value
    var dist = document.getElementById("distance").value
    var category = document.getElementById("category").value
    var auto_detect = document.getElementById("auto-detect").checked

    var url = "/search?keyword=" + encodeURIComponent(keyword) + "&dist=" + dist + "&category=" + category +
    "&auto_detect=" + auto_detect

    if (!auto_detect) {
        var loc = document.getElementById("loc").value
        url += ("&loc=" + encodeURIComponent(loc))
    }
        
    var xmlhttp = new XMLHttpRequest()

    xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            if (this.responseText == "No Results Found"){
                no_result = "<p style='text-align: center; margin: 0px; width: 1104px; background-color: white;'>" + 
                "No records has been found</p>"
                document.getElementById("search_results").innerHTML = no_result
            }
            else {
                createTable(JSON.parse(this.responseText))
            }
            
       }
    }

    xmlhttp.open("GET", url, true)
    xmlhttp.send()

    return false
}

function createTable(businesses) {
    var info = businesses["businesses"]
    var html_table = "<table class='result_table' id='result_table'><tr>" +
        "<th class='result_header' style='width: 59px'>No.</th>" +
        "<th class='result_header' style='width: 128px'>Image</th>" +
        "<th class='result_header' style='width: 548px; cursor: pointer' onclick='sortOnclick(2)'>Business Name</th>" +
        "<th class='result_header' style='width: 178px; cursor: pointer' onclick='sortOnclick(3)'>Rating</th>" +
        "<th class='result_header' style='width: 179px; cursor: pointer' onclick='sortOnclick(4)'>Distance (miles)</th></tr>"

    for (let i = 0; i < info.length; i++) {
        row = "<tr><td class='result_cell'>" + (i + 1) + "</td>" +
            "<td class='result_cell'><img class='result_img' src=" + info[i]["image"] +" alt=''></img></td>" + 
            "<td class='result_cell'><p class='name' onclick=\"getDetail(\'" + info[i]["id"] + "\')\">" + info[i]["name"] + "</p></td>" +
            "<td class='result_cell'><p>" + info[i]["rating"] + "</p></td>" +
            "<td class='result_cell'><p>" + info[i]["distance"] + "</p></td></tr>"
        html_table += row
    }
    html_table += "</table>"

    document.getElementById("search_results").innerHTML = html_table
    
    name_col = 0
    rating_col = 0
    dist_col = 0
}

function sortOnclick(column) {
    if (column == 2) {
        if (name_col == 0){
            ascSort(2)
            name_col = 1
        }
        else {
            reverseTable()
            name_col = name_col * -1
        }
        rating_col = 0
        dist_col = 0
    }
    else if (column == 3) {
        if (rating_col == 0){
            ascSort(3)
            rating_col = 1
        }
        else {
            reverseTable()
            rating_col = rating_col * -1
        }
        name_col = 0
        dist_col = 0
    }
    else {
        if (dist_col == 0){
            ascSort(4)
            dist_col = 1
        }
        else {
            reverseTable()
            dist_col = dist_col * -1
        }
        name_col = 0
        rating_col = 0
    }

    resetIndex()
}

function ascSort(column) {
    var table = document.getElementById("result_table")
    var num_rows = table.rows.length
    var swapped = true

    while (swapped) {
        swapped = false
        for (let i = 1; i < (num_rows - 1); i++) {
            rows = table.rows
    
            cur_val = rows[i].cells[column].childNodes[0].innerHTML.toUpperCase()
            next_val = rows[i+1].cells[column].childNodes[0].innerHTML.toUpperCase()
            if (cur_val > next_val) {
                rows[i].parentNode.insertBefore(rows[i + 1], rows[i])
                swapped = true
            }
        }
    }
}

function reverseTable() {
    var table = document.getElementById("result_table")
    var num_rows = table.rows.length

    for (let i = 1; i < (num_rows - 1); i++) {
        rows = table.rows
        rows[1].parentNode.insertBefore(rows[i + 1], rows[1])
    }
}

function resetIndex() {
    var table = document.getElementById("result_table")
    var num_rows = table.rows.length

    for (let i = 1; i < num_rows; i++) {
        table.rows[i].cells[0].innerHTML = i
    }
}


function getDetail(id) {
    var url = "/detail?id=" + id

    var xmlhttp = new XMLHttpRequest()

    xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            createDetail(JSON.parse(this.responseText))
       }
    }

    xmlhttp.open("GET", url, true)
    xmlhttp.send()
}

function createDetail(details){
    var subtitle_col = 0
    var html_detail = "<div class='details'><div class='detail_title'>" + 
        "<p class='detail_title'>" + details["name"] + "</p>" +
        "<hr style='margin-top: 10px; border-top: 1px solid lightgrey'></div>" + 
        "<div class='detail_subtitles'><div class='info_col'></div><div class='info_col'></div></div>" +
        "<div class='detail_photos'><div class='photo_col_left'></div>" +
        "<div class='photo_col_right'></div><div class='photo_col_middle'></div>" +
        "</div></div>"
    
    document.getElementById("detail_results").innerHTML = html_detail

    if (details["status"] != null){
        var node = document.createElement("div")
        var column = document.getElementsByClassName("info_col")[subtitle_col]
        column.appendChild(node)
        
        if (details["status"]) {
            var innerValue = "<p class='detail_subtitle'>Status</p>" + 
                "<div class='status' style='background-color:green'>" + 
                "<p class='status'>Open Now</p></div>"
        }
        else {
            var innerValue = "<p class='detail_subtitle'>Status</p>" + 
                "<div class='status' style='background-color:red'>" + 
                "<p class='status'>Closed</p></div>"
        }
        var kids = column.childNodes
        var last_kid = kids[kids.length - 1]
        last_kid.innerHTML = innerValue

        subtitle_col = (subtitle_col + 1) % 2
    }

    if (details["categories"] != null && details["categories"].length > 0) {
        var node = document.createElement("div")
        var column = document.getElementsByClassName("info_col")[subtitle_col]
        column.appendChild(node)

        var categories = details["categories"][0]["title"]
        for (let i = 1; i < details["categories"].length; i++) {
            categories += " | "
            categories += details["categories"][i]["title"]
        }

        var innerValue = "<p class='detail_subtitle'>Category</p>" + 
                "<p class='info'>" + categories + "</p></div>"
        var kids = column.childNodes
        var last_kid = kids[kids.length - 1]
        last_kid.innerHTML = innerValue

        subtitle_col = (subtitle_col + 1) % 2
    }

    if (details["address"] != null && details["address"] != "") {
        var node = document.createElement("div")
        var column = document.getElementsByClassName("info_col")[subtitle_col]
        column.appendChild(node)

        var address = details["address"]
        var innerValue = "<p class='detail_subtitle'>Address</p>" + 
                "<p class='info'>" + address + "</p></div>"
        var kids = column.childNodes
        var last_kid = kids[kids.length - 1]
        last_kid.innerHTML = innerValue

        subtitle_col = (subtitle_col + 1) % 2
    }

    if (details["phone"] != null && details["phone"] != "") {
        var node = document.createElement("div")
        var column = document.getElementsByClassName("info_col")[subtitle_col]
        column.appendChild(node)

        var phone = details["phone"]
        var innerValue = "<p class='detail_subtitle'>Phone Number</p>" + 
                "<p class='info'>" + phone + "</p></div>"
        var kids = column.childNodes
        var last_kid = kids[kids.length - 1]
        last_kid.innerHTML = innerValue

        subtitle_col = (subtitle_col + 1) % 2
    }

    if (details["transactions"] != null && details["transactions"].length > 0) {
        var node = document.createElement("div")
        var column = document.getElementsByClassName("info_col")[subtitle_col]
        column.appendChild(node)

        var transactions = details["transactions"][0]
        for (let i = 1; i < details["transactions"].length; i++) {
            categories += " | "
            categories += details["transactions"][i]
        }

        var innerValue = "<p class='detail_subtitle'>Transactions Supported</p>" + 
                "<p class='info'>" + transactions + "</p></div>"
        var kids = column.childNodes
        var last_kid = kids[kids.length - 1]
        last_kid.innerHTML = innerValue

        subtitle_col = (subtitle_col + 1) % 2
    }

    if (details["price"] != null && details["price"] != "") {
        var node = document.createElement("div")
        var column = document.getElementsByClassName("info_col")[subtitle_col]
        column.appendChild(node)

        var price = details["price"]
        var innerValue = "<p class='detail_subtitle'>Price</p>" + 
                "<p class='info'>" + price + "</p></div>"
        var kids = column.childNodes
        var last_kid = kids[kids.length - 1]
        last_kid.innerHTML = innerValue

        subtitle_col = (subtitle_col + 1) % 2
    }

    if (details["url"] != null && details["url"] != "") {
        var node = document.createElement("div")
        var column = document.getElementsByClassName("info_col")[subtitle_col]
        column.appendChild(node)

        var url = details["url"]
        var innerValue = "<p class='detail_subtitle'>More Info</p>" + 
                "<a class='info' href='" + url + "' target='_blank'>Yelp</a></div>"
        var kids = column.childNodes
        var last_kid = kids[kids.length - 1]
        last_kid.innerHTML = innerValue

        subtitle_col = (subtitle_col + 1) % 2
    }

    if (details["photos"] != null && details["photos"].length > 0) {
        var innerValue = "<img class='detail' src=" + details["photos"][0] +" alt=''></img>" +
            "<p class='caption'>Photo 1</p>"
        var card = document.getElementsByClassName("photo_col_left")[0]
        card.innerHTML = innerValue

        if (details["photos"].length > 1) {
            innerValue = "<img class='detail' src=" + details["photos"][1] +" alt=''></img>" +
            "<p class='caption'>Photo 2</p>"
            card = document.getElementsByClassName("photo_col_middle")[0]
            card.innerHTML = innerValue
        }

        if (details["photos"].length > 2) {
            innerValue = "<img class='detail' src=" + details["photos"][2] +" alt=''></img>" +
                "<p class='caption'>Photo 3</p>"
            card = document.getElementsByClassName("photo_col_right")[0]
            card.innerHTML = innerValue
        }
    }


    var result = document.getElementById("detail_results")
    result.scrollIntoView()
    
}