type Edge = {
  node: {
    edge_media_preview_like: {
      count: number;
    };
    edge_media_to_comment: {
      count: number;
    };
  };
};

type EdgeOwnerToTimelineMedia = {
  count: number;
  edges: Edge[];
  page_info: {
    edge_cursor: string;
    has_next_page: boolean;
  };
};
