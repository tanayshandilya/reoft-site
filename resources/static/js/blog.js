const BLOG = {
    posts : [],
    updatePosts : ( arr ) => {
        BLOG.posts = arr;
    },
    searchPosts : () => {
        if ( $('#searchTerm').val() !== '' ) {
            let results = SEARCH.blogPostSearch( SEARCH.titleCase($('#searchTerm').val()) );
            $('#allPosts').fadeOut(), 
            $('.page-heading').html('Search Results'), 
            $('.page-sub-heading').html(SEARCH.titleCase($('#searchTerm').val()));
            if ( results.length > 0 ) {
                $('#searchResults').html('').fadeIn();
                for (let i = 0; i < results.length; i++) {
                    $('#searchResults')
                    .append(`<div class="col-md-4">
                    <div class="xv-product-unit reoft-blog-card">
                        <div class="xv-product mb-15 mt-15 paper-block">
                            <figure>
                                <a href="/post/`+results[i].post_slug+`"><img class="xv-superimage" src="/`+results[i].post_feature_image+`" alt="`+results[i].post_title+`"></a>
                                <figcaption>
                                    <ul class="style1">
                                        <li><a class=" btn-square btn-info" href="#"><i class="icon icon-heart-o"></i></a></li>
                                        <li><a class=" btn-square btn-info" href="#"><i class="icon icon-turned_in_not"></i></a></li>
                                        <li><a class="btn-cart btn-square btn-info" href="mailto:?Subject=`+results[i].post_title+`&amp;Body=I saw this and thought you should see this too: `+window.location.protocol+`//`+window.location.host+`/post/`+results[i].post_slug+`"><i class="icon icon-share"></i></a></li>
                                    </ul>
                                </figcaption>
                            </figure>
                            <div class="xv-product-content">
                                <h5 class="blog-title"><a href="/post/`+results[i].post_slug+`">`+results[i].post_title+`</a></h5>
                                <p>`+results[i].post_excerpt+`</p>
                                <a href="/post/`+results[i].post_slug+`" class="btn btn-block btn-outline-info">Read Article</a>
                            </div>
                        </div>
                    </div>
                </div>`);
                }
            }
        }
    },
    clearSearch : () => {
        if ( $('#searchTerm').val() === '' ) {
            $('.page-heading').html('Blog Posts');
            $('.page-sub-heading').html('Sed eget orci eleifend enim mattis suscipit. Suspendisse potenti nonipsum.');
            $('#searchResults').fadeOut();
            $('#allPosts').fadeIn();
        }
    }
}

$(document).ready(() => {
    $.post('/api/v1/pull/blog/'+$('#blogApiToken').val(),{},(resp) => {
        BLOG.updatePosts(resp);
    });
    $('#searchTerm').on('propertychange input',() => {
        BLOG.searchPosts();
    });
    $('#postSearch').on('submit', (e) => {
        e.preventDefault(); e.stopPropagation();
        BLOG.searchPosts();
    });
    $('#searchTerm').on('focusout',function(){
        BLOG.clearSearch();
    });
});