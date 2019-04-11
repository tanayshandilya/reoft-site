module.exports = {
    select: {
        all: {
            openProjects: 'SELECT * FROM `open_projects` WHERE `project_status` = "published"',
            projetcCategories: 'SELECT * FROM `categories` WHERE `category_type` = "project"',
            testimonials: 'SELECT * FROM `testimonials`',
            jobs: 'SELECT * FROM `jobs`',
            posts: 'SELECT * FROM `posts` WHERE `post_status` = "published"',
            apiPosts: 'SELECT `post_title`, `post_slug`, `post_feature_image`, `post_excerpt` FROM `posts` WHERE `post_status` = "published"',
            featuredProducts: 'SELECT * FROM `shop` WHERE `product_type` = "featured"',
            regularProducts: 'SELECT * FROM `shop` WHERE `product_type` = "regular"',
            allProducts: 'SELECT * FROM `shop`',
            products: 'SELECT `product_name`, `product_slug`, `product_code`, `product_price` FROM `shop`',
            teamMembers: 'SELECT * FROM `users` WHERE `user_username`!= "admin" AND `user_role` = "admin" AND `user_account_status` = "active"',
            productCategories: 'SELECT * FROM `categories` WHERE `category_type` = "product"',
        },
        api: {
            products: 'SELECT `product_name`, `product_slug`, `product_code`, `product_price`, `product_featured_image`, `product_rating` FROM `shop`',
        },
        by: {
            productsCode: 'SELECT * FROM `shop` WHERE `product_code` = ?',
            postSlug: 'SELECT * FROM `posts` WHERE `post_slug` = ?',
            projectSlug: 'SELECT * FROM `open_projects` WHERE `project_slug` = ?',
            productSlug: 'SELECT * FROM `shop` WHERE `product_slug` = ?',
            userUname: 'SELECT * FROM `users` WHERE `user_username` = ?',
            pageSlug: 'SELECT * FROM `doc_pages` WHERE `page_slug` = ?',
            jobSlug: 'SELECT * FROM `jobs` WHERE `job_slug` = ?',
            jobUUID: 'SELECT * FROM `jobs` WHERE `job_uuid` = ?',
            wishlistUUID: 'SELECT * FROM `wishlist` WHERE `list_user_uuid` = ?',
            feedbackPostSlug: 'SELECT `post_positive_feedback_count`, `post_negative_feedback_count` FROM `posts` WHERE `post_slug` = ?'
        },
        loginDetails: 'SELECT `user_uuid`, `user_email`, `user_password`, `user_username` FROM `users` WHERE `user_email` = ?',
        similarProducts: 'SELECT * FROM `shop` ORDER BY RAND() LIMIT 10'
    },
    insert: {
        email: 'INSERT INTO `subscriptions`(`subs_uuid`, `subs_email`, `subs_registered`) VALUES (?, ?, ?)',
        contact: 'INSERT INTO `contact_form`(`contact_uuid`, `contact_name`, `contact_email`, `contact_phone`, `contact_company`, `contact_subject`, `contact_message`, `contact_date`) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        jobApplication: 'INSERT INTO `applications`(`apply_uuid`, `apply_job_uuid`, `apply_timestamp`, `apply_firstname`, `apply_lastname`, `apply_email`, `apply_phone`, `apply_dob`, `apply_permanent_address1`, `apply_permanent_address2`, `apply_permanent_city`, `apply_permanent_province`, `apply_permanent_postal`, `apply_permanent_country`, `apply_communication_address1`, `apply_communication_address2`, `apply_communication_city`, `apply_communication_province`, `apply_communication_postal`, `apply_communication_country`, `apply_education_institute`, `apply_education_course`, `apply_education_city`, `apply_education_province`, `apply_education_from`, `apply_education_to`, `apply_education_cgpa`, `apply_education_total`, `apply_experience_from`, `apply_experience_to`, `apply_experience_organization`, `apply_experience_city`, `apply_experience_postal`, `apply_experience_province`, `apply_experience_country`, `apply_question_answers`, `apply_resume`) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
        postComment: 'INSERT INTO `comments`(`comment_post_id`, `comment_author_id`, `comment_author_name`, `comment_author_email`, `comment_author_image`, `comment_author_profile_slug`, `comment_content`, `comment_status`, `comment_timestamp`) VALUES ( ?,?,?,?,?,?,?,?,? )'
    },
    update: {
        pageHelpful: 'UPDATE `doc_pages` SET `page_helpful` = ? WHERE `page_slug` = ?',
        pageNotHelpful: 'UPDATE `doc_pages` SET `page_nothelpful` = ? WHERE `page_slug` = ?',
        postPositiveFeedback: 'UPDATE `posts` SET `post_positive_feedback_count`= ? WHERE `post_slug` = ?',
        postNegativeFeedback: 'UPDATE `posts` SET `post_negative_feedback_count`= ? WHERE `post_slug` = ?',
        accountInfo: 'UPDATE `users` SET `user_firstname`= ? ,`user_lastname`= ? ,`user_email`= ? ,`user_phone`= ? , `user_facebook`= ?,`user_linkedin`= ?,`user_introduction`= ?,`user_description`= ?,`user_company_name`= ?,`user_company_site`= ?,`user_designation`= ?,`user_address1`= ?,`user_address2`= ?,`user_city`= ?,`user_postcode`= ?,`user_province` = ?,`user_country`= ? WHERE `user_uuid` = ?',
        passwordInfo: 'UPDATE `users` SET `user_password`= ?  WHERE `user_uuid` = ?'
    }
}